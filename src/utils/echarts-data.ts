import { isEmpty } from 'lodash'

export function parseCollaboratorsData(repoData) {
  if (isEmpty(repoData)) return
  return {
    title: {
      text: 'collaborators',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'bottom'
    },
    series: [
      {
        name: 'affiliation',
        type: 'pie',
        radius: '50%',
        center: ['50%', '55%'],
        data: [
          { value: repoData.directCollaboratorCount, name: 'DIRECT' },
          {
            value:
              repoData.allCollaboratorCount - repoData.directCollaboratorCount,
            name: 'OUTSIDE'
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}

export function parseStargazersData(repoData) {
  if (isEmpty(repoData)) return
  return {
    title: {
      text: 'Stargazers',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    legend: {
      top: 'bottom'
    },
    series: [
      {
        name: 'affiliation',
        type: 'pie',
        radius: '50%',
        center: ['50%', '55%'],
        data: [
          { value: repoData.directCollaboratorCount, name: 'DIRECT' },
          {
            value:
              repoData.allCollaboratorCount - repoData.directCollaboratorCount,
            name: 'OUTSIDE'
          }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
}
