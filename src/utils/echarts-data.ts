import { EChartsOption } from 'echarts/types/dist/echarts'
import { isEmpty } from 'lodash'
import { useCallback, useEffect, useState } from 'react'

import { readStargazers, readWatchers, TUser } from './db'

const baseInfoKeys = [
  'anyPinnableItems',
  'bio',
  'company',
  'email',
  'location',
  'twitterUsername',
  'websiteUrl'
]

const advInfoKeys = [
  'hasSponsorsListing',
  'isBountyHunter',
  'isCampusExpert',
  'isDeveloperProgramMember',
  'isEmployee',
  'isHireable',
  'isSiteAdmin'
]

function diffYear(a: number, b: number) {
  return new Date(a - b).getFullYear() - 1970
}

function calcCount(
  arr: number[],
  value: number,
  limit = [0, 1, 10, 100, 1000]
) {
  if (value < limit[0]) {
    return
  }
  let index = 1
  for (; index < limit.length; index++) {
    if (value <= limit[index]) {
      arr[index - 1]++
      return
    }
  }
  arr[index - 1]++
}

const xAxisNames = [
  'users',
  'users',
  'users',
  'users',
  'users',
  'users',
  'users'
]
const yAxisNames = [
  {
    key: 'years',
    value: ['[0, 1]', '(1, 3]', '(3, 5]', '(5, 10]', '(10, +∞)']
  },
  {
    key: 'starred',
    value: ['1', '(1, 10]', '(10, 100]', '(100, 1000]', '(1000, +∞)']
  },
  {
    key: 'commits',
    value: ['1', '(1, 3]', '(3, 5]', '(5, 10]', '(10, +∞)']
  },
  {
    key: 'issues',
    value: ['0', '(1, 10]', '(10, 50]', '(50, 100]', '(100, +∞)']
  },
  {
    key: 'pr',
    value: ['0', '(1, 10]', '(10, 50]', '(50, 100]', '(100, +∞)']
  },
  {
    key: 'followers',
    value: ['0', '(1, 10]', '(10, 50]', '(50, 100]', '(100, +∞)']
  },
  {
    key: 'activity',
    value: ['0', '1', '(1, 3]', '(3, 10]', '(10, +∞)']
  }
]

export function useEchartsOptions(repoData) {
  const [currentDate] = useState(new Date().getTime())
  const [options, setOptions] = useState<EChartsOption>()
  const parseOptions = useCallback((data: TUser[]) => {
    // regdatedAt <=1年 1～3年 3～5年 5~10年 >= 10年 pie
    const regdatedAt = new Array<number>(5).fill(0)
    // starredRepositories <=1 1～10 10~100 100~1000 >=1000
    const starredRepositories = new Array<number>(5).fill(0)
    // commitComments <=1 1～10 10~50 50~500 >=500
    const commitComments = new Array<number>(5).fill(0)
    // issues <1 1～10 10~50 50~500 >=500
    const issues = new Array<number>(5).fill(0)
    // pullRequests <1 1～10 10~50 50~500 >=500
    const pullRequests = new Array<number>(5).fill(0)
    // followers <1 1～10 10~50 50~100 >=100
    const followers = new Array<number>(5).fill(0)
    const userActivity = new Array<number>(5).fill(0)
    data.forEach((u) => {
      const diffDate = diffYear(currentDate, new Date(u.createdAt).getTime())
      const starredCount = u.starredRepositories.totalCount
      const commitCount = u.commitComments.totalCount
      const issuesCount = u.issues.totalCount
      const prCount = u.pullRequests.totalCount
      const followerCount = u.followers.totalCount
      let activity = 0
      calcCount(regdatedAt, diffDate, [0, 1, 3, 5, 10])
      calcCount(starredRepositories, starredCount, [1, 1, 10, 100, 1000])
      calcCount(commitComments, commitCount, [1, 1, 3, 5, 10])
      calcCount(issues, issuesCount, [0, 0, 10, 50, 100])
      calcCount(pullRequests, prCount, [0, 0, 10, 50, 100])
      calcCount(followers, followerCount, [0, 0, 10, 50, 100])

      if (baseInfoKeys.some((k) => !!u[k])) {
        activity++
      }
      if (advInfoKeys.some((k) => !!u[k])) {
        activity += 3
      }
      activity += Math.floor(starredCount / 100)
      activity += Math.ceil(commitCount / 100)
      activity += Math.ceil(issuesCount / 10)
      activity += Math.ceil(prCount / 10)
      activity += Math.round(followerCount / 10)
      calcCount(userActivity, activity, [0, 0, 1, 3, 10])
    })
    return [
      {
        key: 'Regdated',
        value: regdatedAt
      },
      {
        key: 'Starred Repositories',
        value: starredRepositories
      },
      {
        key: 'Commit Comments',
        value: commitComments
      },
      {
        key: 'Issues',
        value: issues
      },
      {
        key: 'Pull Requests',
        value: pullRequests
      },
      {
        key: 'Followers',
        value: followers
      },
      {
        key: 'User Activity',
        value: userActivity
      }
    ]
  }, [])
  useEffect(() => {
    if (isEmpty(repoData)) return
    ;(async () => {
      const stargazersData = parseOptions(
        await readStargazers(repoData.owner, repoData.name)
      )
      const watchersData = parseOptions(
        await readWatchers(repoData.owner, repoData.name)
      )
      const options = stargazersData.map(
        ({ key, value }, i): EChartsOption => {
          const watcherData = watchersData.find((e) => e.key === key)
          return {
            title: { text: key },
            series: [
              { name: 'stargazers', type: 'bar', data: value },
              { name: 'watchers', type: 'bar', data: watcherData?.value }
            ],
            legend: {
              data: ['stargazers', 'watchers'],
              selected: {
                watchers: false
              }
            },
            tooltip: {
              show: true
            },
            xAxis: {
              show: true,
              name: xAxisNames[i],
              type: 'value',
              boundaryGap: [0, 0.01]
            },
            yAxis: {
              show: true,
              name: yAxisNames[i].key,
              data: yAxisNames[i].value,
              type: 'category',
              axisLabel: {
                interval: 0,
                rotate: 30
              },
              splitLine: { show: false }
            }
          }
        }
      )
      const stargazersUserActivityData =
        stargazersData.find((e) => e.key === 'User Activity')?.value || []
      const watchersUserActivityData =
        watchersData.find((e) => e.key === 'User Activity')?.value || []
      options.push({
        title: { text: 'developer participation' },
        legend: {
          data: ['hardly', 'active', 'quality'],
          selected: {
            watchers: true
          }
        },
        dataset: {
          source: [
            ['type', 'stargazers', 'watchers'],
            [
              'quality',
              stargazersUserActivityData[4],
              watchersUserActivityData[4]
            ],
            [
              'active',
              stargazersUserActivityData[2] + stargazersUserActivityData[3],
              watchersUserActivityData[2] + watchersUserActivityData[3]
            ],
            [
              'hardly',
              stargazersUserActivityData[0] + stargazersUserActivityData[1],
              watchersUserActivityData[0] + watchersUserActivityData[1]
            ]
          ]
        },
        series: [
          {
            name: 'stargazers',
            type: 'pie',
            center: ['25%', '50%'],
            radius: ['25%', '50%'],
            color: ['#546FC6', '#91CD76', '#EF6667'],
            encode: {
              itemName: 'type',
              value: 'stargazers'
            },
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            zlevel: 100
          },
          {
            name: 'watchers',
            type: 'pie',
            center: ['75%', '50%'],
            radius: ['25%', '50%'],
            color: ['#546FC6', '#91CD76', '#EF6667'],
            encode: {
              itemName: 'type',
              value: 'watchers'
            },
            avoidLabelOverlap: false,
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            zlevel: 100
          }
        ],
        tooltip: {
          show: false
        },
        xAxis: {
          show: false
        },
        yAxis: {
          show: false
        }
      })
      setOptions({
        baseOption: {
          timeline: {
            axisType: 'category',
            autoPlay: true,
            playInterval: 10000,
            data: stargazersData
              .map((e) => e.key)
              .concat(['Developer Participation'])
          },
          calculable: true,
          grid: {
            top: '15%',
            left: '5%',
            right: '10%',
            bottom: '15%',
            tooltip: {
              trigger: 'axis',
              axisPointer: {
                type: 'shadow',
                label: {
                  show: true
                }
              }
            },
            containLabel: true
          },
          title: {
            //   subtext: 'reference only'
          },
          tooltip: {},
          legend: {
            align: 'right'
          }
        },
        options
      })
    })()
  }, [repoData])
  return options
}
