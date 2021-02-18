// TODO Github Sync 队列
// x-ratelimit-limit
// x-ratelimit-remaining
// x-ratelimit-reset
// x-ratelimit-used

import { clientId, clientSecret } from "../constants"

// https://api.github.com/graphql
// "Authorization": "7735f072e870628f401870095d7e952f3f370907"
// acc0c7f72b3237d4349bb10bdb0e8a1f28d68cae

// TODO status 200 需要记录成功状态 （计算两次请求的间隔）

// TODO 请求用户信息可以使用 ETag 优化请求次数

// Note: Github Graphql 接口可以请求 watchers 参数，但是 collaborators、stargazers 等暂无权限获取，需要改用 RestFul 接口
// https://api.github.com/repos/nervjs/taro/stargazers
// https://api.github.com/search/users?q=repos:%3C1+followers:%3C1&page=1&per_page=100

export async function getGithubToken(code: string): Promise<string> {
  const res = fetch(`https://github.com/login/oauth/access_token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}`)
  return res.then(response => response.json()).then(e => e.access_token)
}
