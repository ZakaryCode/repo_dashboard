import { InMemoryCache } from '@apollo/client/cache/inmemory/inMemoryCache'
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types'
import { ApolloClient } from '@apollo/client/core/ApolloClient'
import { OperationVariables } from '@apollo/client/core/types'
import { QueryOptions } from '@apollo/client/core/watchQueryOptions'
import { ApolloLink } from '@apollo/client/link/core/ApolloLink'
import { createHttpLink } from '@apollo/client/link/http'

import { endpoint } from '../../constants'

export default class Queue<T> {
  items: T[] = []

  isLoading = false

  enqueue = (...elements: T[]) => {
    this.items.push(...elements)
  }

  dequeue = () => {
    return this.items.shift()
  }

  get front() {
    return this.items[0]
  }

  get isEmpty() {
    return this.items.length === 0
  }

  get size() {
    return this.items.length
  }
}

type TQuery = {
  rateLimit?: {
    limit: number
    cost: number
    remaining: number
    resetAt: string
  }
}

export interface IGithubGraphType<TQ = Record<string, any>> {
  type: 'graphql'
  query: QueryOptions<OperationVariables, TQ & TQuery>
  callback?: (res: TQ, nextTime: number) => void | Promise<void>
}

export interface IGithubFetchType<TRes = Record<string, any>> {
  type: 'restful'
  url: string
  callback?: (res: TRes) => void
}

export class GithubApiQueue {
  readonly client: ApolloClient<NormalizedCacheObject>
  protected rateLimit = {
    limit: 5000,
    remaining: 5000,
    used: 0,
    reset: 1640995200
  }

  protected rateLimitQ = {
    limit: 5000,
    remaining: 5000,
    cost: 0,
    reset: 1640995200
  }

  APIQueue: Queue<IGithubFetchType>
  GqlQueue: Queue<IGithubGraphType>
  constructor(readonly token: string) {
    this.APIQueue = new Queue()
    this.GqlQueue = new Queue()
    const httpLink = createHttpLink({
      uri: endpoint,
      fetchOptions: {
        timeout: 30000
      }
    })
    const authMiddleware = new ApolloLink((operation, forward) => {
      operation.setContext({
        headers: {
          authorization: `token ${token}`
        }
      })
      return forward(operation)
    })

    this.client = new ApolloClient({
      link: authMiddleware.concat(httpLink),
      cache: new InMemoryCache({
        // addTypename: false,
        resultCaching: true
      })
    })
  }

  runAPI = async () => {
    const n = this.APIQueue.dequeue()
    if (!n) return
    this.APIQueue.isLoading = true
    try {
      const res = await this.get(n.url)
      typeof n.callback === 'function' && n.callback(res)
    } catch (error) {
      typeof n.callback === 'function' && n.callback({})
    }

    if (!this.APIQueue.isEmpty) {
      const nextTime = this.nextCallTime(
        this.rateLimit.remaining,
        this.rateLimit.reset
      )
      console.log(
        'nextTime',
        nextTime,
        this.rateLimit.remaining,
        this.rateLimit.reset
      )
      setTimeout(() => {
        this.runAPI()
      }, nextTime)
    } else {
      this.APIQueue.isLoading = false
    }
  }

  runGql = async (...list: IGithubGraphType[]) => {
    if (list.length > 0) {
      this.GqlQueue.enqueue(...list)
    }
    const n = this.GqlQueue.dequeue()
    if (!n) return
    this.GqlQueue.isLoading = true
    const res = await this.query(n.query)
    const nextTime = this.nextCallTime(
      this.rateLimitQ.remaining,
      this.rateLimitQ.reset
    )
    typeof n.callback === 'function' && (await n.callback(res, nextTime))

    if (!this.GqlQueue.isEmpty) {
      const nextTime = this.nextCallTime(
        this.rateLimitQ.remaining,
        this.rateLimitQ.reset
      )
      setTimeout(() => {
        this.runGql()
      }, nextTime)
    } else {
      this.GqlQueue.isLoading = false
    }
  }

  get = async (url: string) => {
    const res = await fetch(url, {
      headers: {
        // 'Access-Control-Allow-Origin': '*',
        // 'Access-Control-Allow-Headers': 'Authorization, Content-Type, If-Match, If-Modified-Since, If-None-Match, If-Unmodified-Since, X-GitHub-OTP, X-Requested-With',
        // 'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE',
        // 'Access-Control-Expose-Headers': 'ETag, Link, X-GitHub-OTP, X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset, X-OAuth-Scopes, X-Accepted-OAuth-Scopes, X-Poll-Interval',
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${this.token}`
      }
    }).then((e) => e.json())
    const rateLimit = await fetch('https://api.github.com/rate_limit', {
      headers: {
        accept: 'application/vnd.github.v3+json',
        authorization: `token ${this.token}`
      }
    })
      .then((e) => e.json())
      .then((e) => e.rate)
    this.rateLimit.limit = rateLimit.limit
    this.rateLimit.remaining = rateLimit.remaining
    this.rateLimit.used = rateLimit.used
    this.rateLimit.reset = rateLimit.reset
    return res
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  query = async <TQ = Record<string, any>>(
    query: QueryOptions<OperationVariables, TQ & TQuery>
  ) => {
    const d = this.client.readQuery(query)
    if (d) {
      return d
    }
    const { data } = await this.client.query(query)
    const { rateLimit } = data
    if (rateLimit) {
      this.rateLimitQ.limit = rateLimit.limit
      this.rateLimitQ.remaining = rateLimit.remaining
      this.rateLimitQ.cost = rateLimit.cost
      this.rateLimitQ.reset = new Date(rateLimit.resetAt).getTime() / 1000
    }
    return data
  }

  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  getList = async (list: IGithubFetchType[]) => {
    const listRes = list.map((l) => {
      return new Promise((resolve) => {
        if (typeof l.callback === 'function') {
          const cb = l.callback
          l.callback = (res) => {
            try {
              cb(res)
            } catch (error) {
              console.error(error)
            }
            resolve(res)
          }
        } else {
          l.callback = (res) => {
            resolve(res)
          }
        }
      })
    })
    this.APIQueue.enqueue(...list)
    if (!this.APIQueue.isLoading) {
      this.runAPI()
    }

    return Promise.all(listRes)
  }

  private nextCallTime = (remaining: number, reset: number) => {
    const now = new Date().getTime()
    const resetTime = reset * 1000 - now
    return resetTime / remaining
  }
}
