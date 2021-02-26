import { identity, omit, pick, pickBy } from 'lodash'

import { dbName } from '../constants'
import { getCurrentDate } from './time'

const request = window.indexedDB.open(dbName)
let db: IDBDatabase

request.onerror = () => {
  console.log('数据库打开报错')
}

request.onsuccess = () => {
  db = request.result
  console.log('数据库打开成功')
}

request.onupgradeneeded = (event) => {
  const db = request.result
  if (event.oldVersion < 1) {
    // 1.id 仓库 ID [:owner/:name]  2.updateAt 上次更新时间 3.owner 4.name
    db.createObjectStore('repositories', { keyPath: 'id' })
    // 1.databaseId 2.login 3.name ...
    const userStore = db.createObjectStore('users', { keyPath: 'id' })
    // 1.repo_id 仓库 ID [:owner/:name]  2.updateAt 上次更新时间 3.user_id => databaseId Note: 失效要删除
    const stargazerStore = db.createObjectStore('repositories_stargazers', {
      keyPath: 'id',
      autoIncrement: true
    })
    const watcherStore = db.createObjectStore('repositories_watchers', {
      keyPath: 'id',
      autoIncrement: true
    })
    userStore.createIndex('by_login', 'login', { unique: true })
    userStore.createIndex('by_name', 'name')
    stargazerStore.createIndex('by_repo_id', 'repo_id')
    stargazerStore.createIndex('by_user_id', 'user_id')
    watcherStore.createIndex('by_repo_id', 'repo_id')
    watcherStore.createIndex('by_user_id', 'user_id')
  }
}

export async function inputRepository(
  owner: string,
  name: string,
  data,
  updateAt?: number
) {
  await inputRepo(owner, name, data, updateAt)
  await inputStargazers(owner, name, data, updateAt)
  await inputWatchers(owner, name, data, updateAt)
}

export async function inputRepo(
  owner: string,
  name: string,
  data,
  updateAt?: number
): Promise<void> {
  const request = db.transaction('repositories', 'readwrite')
  const repo = request.objectStore('repositories')
  const id = `${owner}/${name}`
  return new Promise((resolve, reject) => {
    const repoData = repo.get(id)
    repoData.onsuccess = () => {
      if (repoData.result) {
        const res = repo.put({
          id,
          owner,
          name,
          updateAt: updateAt || getCurrentDate(),
          ...parseRepoData(data),
          ...pickBy(
            omit(repoData.result, ['id', 'owner', 'name', 'updateAt']),
            identity
          )
        })
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error(`更新仓库信息 ${id} 失败!`))
      } else {
        const res = repo.add({
          id,
          owner,
          name,
          updateAt: updateAt || getCurrentDate(),
          ...parseRepoData(data)
        })
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error(`更新仓库信息 ${id} 失败!`))
      }
    }

    repoData.onerror = () => reject(new Error(`读取仓库信息 ${id} 失败!`))
  })
}

export async function inputStargazers(
  owner: string,
  name: string,
  data,
  updateAt?: number
): Promise<void> {
  return new Promise((resolve, reject) => {
    const request = db.transaction('repositories_stargazers', 'readwrite')
    const id = `${owner}/${name}`
    const stargazers = request.objectStore('repositories_stargazers')
    const stargazersRepoIndex = stargazers.index('by_repo_id')
    const stargazersRepoCursor = stargazersRepoIndex.openCursor(
      IDBKeyRange.only(id)
    )
    const nodes: { databaseId: number }[] =
      data?.stargazers?.nodes?.slice(0) || []
    const userInList: { databaseId: number }[] = []
    const list: Parameters<typeof inputStargazer>[] = []

    stargazersRepoCursor.onsuccess = (event) => {
      // @ts-ignore
      const cursor = event.target?.result
      if (cursor) {
        const value = cursor.value
        const index = nodes.findIndex((e) => e.databaseId === value.user_id)
        if (index >= 0) {
          const v = nodes.splice(index, 1)
          userInList.push(v[0])
          list.push([
            { ...value, updateAt: updateAt || getCurrentDate() },
            'put'
          ])
        } else if (value.updateAt !== updateAt) {
          list.push([{ id: value.id }, 'delete'])
        }
        cursor.continue()
      } else {
        asyncWriteData()
      }
    }
    stargazersRepoCursor.onerror = () =>
      reject(new Error('读取 stargazers 信息失败！'))

    async function asyncWriteData() {
      await Promise.all(
        userInList.map(async (e) => {
          await inputUser(e)
        })
      )
      await Promise.all(
        list.map(async (e) => {
          await inputStargazer(...e)
        })
      )
      await Promise.all(
        nodes.map(async (e) => {
          await inputStargazer(
            {
              repo_id: id,
              user_id: e.databaseId,
              updateAt: updateAt || getCurrentDate()
            },
            'add'
          )
          await inputUser(e)
        })
      )
      resolve()
    }
  })
}

export async function inputStargazer(d, type = 'add'): Promise<void> {
  if (!d || !type) return
  const { id, ...data } = d
  return new Promise((resolve, reject) => {
    const request = db.transaction('repositories_stargazers', 'readwrite')
    const stargazers = request.objectStore('repositories_stargazers')
    let res: IDBRequest<IDBValidKey | undefined>
    if (type === 'delete') {
      if (id) {
        res = stargazers.delete(id)
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error('删除 stargazers 信息失败！'))
      } else {
        reject(new Error('删除 stargazers 信息失败！'))
      }
    } else if (data) {
      const label = type === 'add' ? '新增' : '更新'
      res = stargazers[type](data)
      res.onsuccess = () => resolve()
      res.onerror = () => reject(new Error(`${label} stargazers 信息失败！`))
    } else {
      reject()
    }
  })
}

export async function inputWatchers(
  owner: string,
  name: string,
  data,
  updateAt?: number
): Promise<void> {
  const request = db.transaction('repositories_watchers', 'readwrite')
  const id = `${owner}/${name}`
  const watchers = request.objectStore('repositories_watchers')
  const watchersRepoIndex = watchers.index('by_repo_id')
  const watchersRepoCursor = watchersRepoIndex.openCursor(IDBKeyRange.only(id))
  const nodes: { databaseId: number }[] = data?.watchers?.nodes?.slice(0) || []
  const userInList: { databaseId: number }[] = []
  const list: Parameters<typeof inputWatcher>[] = []

  return new Promise((resolve, reject) => {
    watchersRepoCursor.onsuccess = (event) => {
      // @ts-ignore
      const cursor = event.target?.result
      if (cursor) {
        const value = cursor.value
        const index = nodes.findIndex((e) => e.databaseId === value.user_id)
        if (index >= 0) {
          const v = nodes.splice(index, 1)
          userInList.push(v[0])
          list.push([
            { ...value, updateAt: updateAt || getCurrentDate() },
            'put'
          ])
        } else if (value.updateAt !== updateAt) {
          list.push([{ id: value.id }, 'delete'])
        }
        cursor.continue()
      } else {
        asyncWriteData()
      }
    }
    watchersRepoCursor.onerror = () =>
      reject(new Error('读取 watchers 信息失败！'))

    async function asyncWriteData() {
      await Promise.all(
        userInList.map(async (e) => {
          await inputUser(e)
        })
      )
      await Promise.all(
        list.map(async (e) => {
          await inputWatcher(...e)
        })
      )
      await Promise.all(
        nodes.map(async (e) => {
          await inputWatcher(
            {
              repo_id: id,
              user_id: e.databaseId,
              updateAt: updateAt || getCurrentDate()
            },
            'add'
          )
          await inputUser(e)
        })
      )
      resolve()
    }
  })
}

export async function inputWatcher(d, type = 'add'): Promise<void> {
  if (!d || !type) return
  const { id, ...data } = d
  return new Promise((resolve, reject) => {
    const request = db.transaction('repositories_watchers', 'readwrite')
    const watchers = request.objectStore('repositories_watchers')
    let res: IDBRequest<IDBValidKey | undefined>
    if (type === 'delete') {
      if (id) {
        res = watchers.delete(id)
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error('删除 watchers 信息失败！'))
      } else {
        reject(new Error('删除 watchers 信息失败！'))
      }
    } else if (data) {
      const label = type === 'add' ? '新增' : '更新'
      res = watchers[type](data)
      res.onsuccess = () => resolve()
      res.onerror = () => reject(new Error(`${label} watchers 信息失败！`))
    } else {
      reject()
    }
  })
}

export function parseRepoData(data) {
  const o = pick(data, ['homepageUrl', 'forkCount', 'pushedAt'])
  const allCollaboratorCount = data?.allCollaborators?.totalCount
  const directCollaboratorCount = data?.directCollaborators?.totalCount
  const stargazerCount = data?.stargazers?.totalCount
  const watcherCount = data?.watchers?.totalCount

  return {
    ...o,
    allCollaboratorCount,
    directCollaboratorCount,
    stargazerCount,
    watcherCount
  }
}

export async function inputUser({
  databaseId: id,
  ...userData
}): Promise<void> {
  const request = db.transaction('users', 'readwrite')
  const user = request.objectStore('users')
  return new Promise((resolve, reject) => {
    const userRes = user.get(id)
    userRes.onsuccess = () => {
      if (userRes.result) {
        const res = user.put({ id, ...userData })
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error(`更新用户信息 ${id} 失败!`))
      } else {
        const res = user.add({ id, ...userData })
        res.onsuccess = () => resolve()
        res.onerror = () => reject(new Error(`新增用户信息 ${id} 失败!`))
      }
    }
  })
}

export async function readRepo(owner: string, name: string): Promise<void> {
  const request = db.transaction('repositories', 'readwrite')
  const repo = request.objectStore('repositories')
  const id = `${owner}/${name}`

  return new Promise((resolve, reject) => {
    const repoData = repo.get(id)
    repoData.onsuccess = () => resolve(repoData.result)
    repoData.onerror = () => reject(new Error(`读取仓库信息 ${id} 失败!`))
  })
}

export type TUser = {
  anyPinnableItems: boolean
  avatarUrl: string
  bio?: string
  commitComments: {
    totalCount: number
  }
  company?: string
  createdAt: string // Data string
  email?: string
  followers: {
    totalCount: number
  }
  hasSponsorsListing: boolean
  isBountyHunter: boolean
  isDeveloperProgramMember: boolean
  isEmployee: boolean
  isHireable: boolean
  isSiteAdmin: boolean
  issues: {
    totalCount: number
  }
  location?: string
  login: string
  name?: string
  pullRequests: {
    totalCount: number
  }
  starredRepositories: {
    totalCount: number
  }
  twitterUsername?: string
  updatedAt: string // Data string
  watching: {
    totalCount: number
  }
  websiteUrl?: string
}

export async function readStargazers(
  owner: string,
  name: string
): Promise<TUser[]> {
  const request = db.transaction(
    ['repositories_stargazers', 'users'],
    'readwrite'
  )
  const id = `${owner}/${name}`
  const stargazers = request.objectStore('repositories_stargazers')
  const stargazersRepoIndex = stargazers.index('by_repo_id')
  const stargazersRepoCursor = stargazersRepoIndex.openCursor(
    IDBKeyRange.only(id)
  )
  const users = request.objectStore('users')

  return new Promise((resolve, reject) => {
    const list: Promise<TUser>[] = []
    stargazersRepoCursor.onsuccess = (event) => {
      // @ts-ignore
      const cursor = event.target?.result
      if (cursor) {
        const value = cursor.value
        list.push(
          new Promise((resolve) => {
            const userData = users.get(value.user_id)
            userData.onsuccess = () => resolve(userData.result)
            userData.onerror = () =>
              reject(new Error(`读取用户信息 ${id} 失败!`))
          })
        )
        cursor.continue()
      } else {
        resolve(Promise.all(list))
      }
    }
    stargazersRepoCursor.onerror = () =>
      reject(new Error('读取 stargazers 信息失败！'))
  })
}

export async function readWatchers(
  owner: string,
  name: string
): Promise<TUser[]> {
  const request = db.transaction(
    ['repositories_watchers', 'users'],
    'readwrite'
  )
  const id = `${owner}/${name}`
  const stargazers = request.objectStore('repositories_watchers')
  const stargazersRepoIndex = stargazers.index('by_repo_id')
  const stargazersRepoCursor = stargazersRepoIndex.openCursor(
    IDBKeyRange.only(id)
  )
  const users = request.objectStore('users')

  return new Promise((resolve, reject) => {
    const list: Promise<TUser>[] = []
    stargazersRepoCursor.onsuccess = (event) => {
      // @ts-ignore
      const cursor = event.target?.result
      if (cursor) {
        const value = cursor.value
        list.push(
          new Promise((resolve) => {
            const userData = users.get(value.user_id)
            userData.onsuccess = () => resolve(userData.result)
            userData.onerror = () =>
              reject(new Error(`读取用户信息 ${id} 失败!`))
          })
        )
        cursor.continue()
      } else {
        resolve(Promise.all(list))
      }
    }
    stargazersRepoCursor.onerror = () =>
      reject(new Error('读取 stargazers 信息失败！'))
  })
}
