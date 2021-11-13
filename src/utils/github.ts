import { gql } from '@apollo/client/core'
import { useCallback, useEffect, useState } from 'react'

import { clientId, clientSecret, tokenName } from '../constants'
import { pageInfoFields, userFields } from '../constants/fragment'
import { inputRepository, readRepo } from './db'
import { queryRepository } from './gql-schema/function'
import { RateLimit } from './gql-schema/queries'
import { GithubApiQueue } from './gql-schema/queue'
import { getQuery, rmQuery } from './index'
import { getCurrentDate, sleep } from './time'

// Note: Github Graphql 接口可以请求 watchers 参数，但是 collaborators、stargazers 等暂无权限获取，需要改用 RestFul 接口
// https://api.github.com/repos/nervjs/taro/stargazers?per_page=100
// https://api.github.com/repos/nervjs/taro/watchers?per_page=100
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
  const [client, setClient] = useState<GithubApiQueue>()
  const [viewer, setViewer] = useState('')
  const [isSyncing, setSyncing] = useState(false)
  const [repoData, setRepoData] = useState<unknown>()
  const [process, setProcess] = useState<[number, number]>([1, 1])

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
      }
    })()
    rmQuery(['code'])
  }, [code])

  useEffect(() => {
    if (!token) return
    const client = new GithubApiQueue(token)
    setClient(client)
  }, [token])

  useEffect(() => {
    if (!client) return
    ;(async () => {
      try {
        const { viewer } = await client.query({
          query: gql`{
  viewer {
    login
    name
  }
  ${RateLimit}
}`
        })
        setViewer(viewer.name || viewer.login)
      } catch (error) {
        console.error('请求错误(query):', error)
      } finally {
        const pathname = window.location.pathname.replace(/^\//, '')
        const [owner, name] = pathname.split('/')
        setRepoData(await readRepo(owner, name))
      }
      // console.log(loading, error, data, refetch, networkStatus)
    })()
  }, [client])

  const syncProcess = useCallback((cents: number[], denominator: number[]) => {
    const count = cents.reduce((p, a) => p + a, 0)
    const total = denominator.reduce((p, a) => p + a, 0)
    setProcess(([c = 0, t = 0]) => [c + count, total || t])
  }, [])

  const handleGithubSync = useCallback(
    async (owner: string, name: string) => {
      if (!client || isSyncing) return
      try {
        setSyncing(true)
        setProcess([0, 0])
        const updateAt = getCurrentDate()
        await syncRepo(client, owner, name, syncProcess, updateAt)
      } catch (error) {
        console.error('请求错误(sync):', error)
      } finally {
        setRepoData(await readRepo(owner, name))
        setSyncing(false)
      }
    },
    [client, isSyncing, syncProcess]
  )

  return {
    token,
    client,
    viewer,
    handleGithubSync,
    isSyncing,
    repoData,
    process
  }
}

async function syncRepo(
  client: GithubApiQueue,
  owner: string,
  name: string,
  syncProcess: (c: number[], d: number[]) => void,
  updateAt?: number,
  cursor?: {
    stargazers?: string
    watchers?: string
  },
  __count?: {
    stargazers: number
    watchers: number
  }
) {
  const count = __count || {
    stargazers: 50,
    watchers: 50
  }
  const stargazersCursor = cursor?.stargazers
  const watchersCursor = cursor?.watchers
  const repoSchema = stargazersCursor
    ? queryRepository(owner, name, {
      stargazers: stargazersCursor,
      count: count.stargazers
    })
    : watchersCursor
      ? queryRepository(owner, name, {
        watchers: watchersCursor,
        count: count.watchers
      })
      : queryRepository(owner, name)

  try {
    await client.runGql({
      type: 'graphql',
      query: {
        query: gql`{
${repoSchema}
${RateLimit}
}
${pageInfoFields}
${userFields}`
      },
      callback: async ({ data, errors, ...rest }, nextTime) => {
        if (errors) {
          console.error('接口错误:', errors)
        }
        const repository = data?.repository || rest?.repository
        const stargazers = repository?.stargazers
        const watchers = repository?.watchers
        await inputRepository(owner, name, repository, updateAt)
        syncProcess(
          [stargazers?.nodes?.length || 0, watchers?.nodes?.length || 0],
          [stargazers?.totalCount || 0, watchers?.totalCount || 0]
        )
        const stargazersPageInfo = stargazers?.pageInfo
        if (
          stargazersPageInfo &&
              stargazersPageInfo.hasNextPage &&
              stargazersPageInfo.endCursor
        ) {
          const args: Parameters<typeof syncRepo> = [
            client,
            owner,
            name,
            syncProcess,
            updateAt,
            {
              stargazers: stargazersPageInfo.endCursor
            }
          ]
          try {
            await sleep(nextTime)
            await syncRepo(...args)
          } catch (error) {
            count.stargazers = Math.max(Math.floor(count.stargazers / 5), 1)
            args[6] = count
            await sleep(nextTime)
            await syncRepo(...args)
            console.error('请求重试(stargazers):', error)
          }
        }
        const watchersPageInfo = watchers?.pageInfo
        if (
          watchersPageInfo &&
              watchersPageInfo.hasNextPage &&
              watchersPageInfo.endCursor
        ) {
          const args: Parameters<typeof syncRepo> = [
            client,
            owner,
            name,
            syncProcess,
            updateAt,
            {
              watchers: watchersPageInfo.endCursor
            }
          ]
          try {
            await sleep(nextTime)
            await syncRepo(...args)
          } catch (error) {
            count.watchers = Math.max(Math.floor(count.watchers / 5), 1)
            args[6] = count
            await sleep(nextTime)
            await syncRepo(...args)
            console.error('请求重试(watchers):', error)
          }
        }
      }
    })
  } catch (error) {
    const args: Parameters<typeof syncRepo> = [
      client,
      owner,
      name,
      syncProcess,
      updateAt,
      cursor
    ]
    count.stargazers = Math.max(Math.floor(count.stargazers / 5), 1)
    count.watchers = Math.max(Math.floor(count.watchers / 5), 1)
    args[6] = count
    await sleep(500)
    await syncRepo(...args)
    console.error('接口错误(syncRepo):', error)
  }
}
