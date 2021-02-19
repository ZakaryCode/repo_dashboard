import { InMemoryCache } from '@apollo/client/cache/inmemory/inMemoryCache'
import { NormalizedCacheObject } from '@apollo/client/cache/inmemory/types'
import { ApolloClient } from '@apollo/client/core/ApolloClient'
import { setContext } from '@apollo/client/link/context'
import { createHttpLink } from '@apollo/client/link/http'
import { useEffect, useState } from 'react'

import { clientId, clientSecret, tokenName } from '../constants'
import { getQuery, rmQuery } from './index'

// Note: Github Graphql 接口可以请求 watchers 参数，但是 collaborators、stargazers 等暂无权限获取，需要改用 RestFul 接口
// https://api.github.com/repos/nervjs/taro/stargazers
// https://api.github.com/search/users?q=repos:%3C1+followers:%3C1&page=1&per_page=100

export async function getGithubToken(code: string): Promise<string> {
  const res = fetch(
    `https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`,
    {
      headers: {
        Accept: 'application/json'
      }
    }
  )
  return res.then((response) => response.json()).then((e) => e.access_token)
}

export function useGithubToken() {
  const [code, setCode] = useState<string>()
  const [token, setToken] = useState<string | null>(null)
  const [client, setClient] = useState<ApolloClient<NormalizedCacheObject>>()

  useEffect(() => {
    const c = getQuery().code
    if (c) {
      if (c instanceof Array) {
        setCode(c[c.length - 1])
      } else {
        setCode(c)
      }
    } else {
      setToken(localStorage.getItem(tokenName))
    }
  }, [])

  useEffect(() => {
    if (!code) return
    ;(async () => {
      const token = await getGithubToken(code)
      if (token) {
        localStorage.setItem(tokenName, token)
        setToken(token)
        window.opener.close()
      } else {
      }
    })()
    rmQuery(['code'])
  }, [code])

  useEffect(() => {
    const httpLink = createHttpLink({
      // https://api.github.com/graphql
      uri: 'https://api.github.com/graphql'
      // x-ratelimit-limit
      // x-ratelimit-remaining
      // x-ratelimit-reset
      // x-ratelimit-used
    })
    const authLink = setContext((_, { headers }) => {
      // return the headers to the context so httpLink can read them
      return {
        headers: {
          ...headers,
          authorization: token ? `token ${token}` : '',
          accept: 'application/json'
        }
      }
    })

    const client = new ApolloClient({
      link: authLink.concat(httpLink),
      cache: new InMemoryCache({
        resultCaching: true
      })
    })

    setClient(client)
  }, [token])

  return { token, client }
}
