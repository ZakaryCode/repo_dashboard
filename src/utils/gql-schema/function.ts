interface IProps {
  name?: boolean
  homepageUrl?: boolean
  forkCount?: boolean
  collaborators?: boolean
  stargazers?: string | boolean
  watchers?: string | boolean
  pushedAt?: boolean
  count?: number
}

const initProps: IProps = {
  name: true,
  homepageUrl: true,
  forkCount: true,
  collaborators: false,
  stargazers: true,
  watchers: true,
  pushedAt: true,
  count: 5
}

export function queryRepository(
  owner: string,
  name: string,
  {
    name: repoName,
    homepageUrl,
    forkCount,
    collaborators,
    stargazers,
    watchers,
    pushedAt,
    count
  } = initProps
) {
  const repositorySchema = `repository(owner: "${owner}", name: "${name}")`
  const nameSchema = repoName ? 'name' : ''
  const homepageUrlSchema = homepageUrl ? '  homepageUrl' : ''
  const forkCountSchema = forkCount ? 'forkCount' : ''
  const collaboratorsSchema = collaborators
    ? `allCollaborators: collaborators (affiliation: ALL) {
    totalCount
  }
  directCollaborators: collaborators (affiliation: DIRECT) {
    totalCount
  }`
    : ''
  const stargazersScheme = stargazers
    ? `stargazers (first: ${count || 1}${
        typeof stargazers === 'string' ? `, after: "${stargazers}"` : ''
      }) {
    nodes {
      ...userFields
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }`
    : ''
  const watchersScheme = watchers
    ? `watchers (first: ${count || 1}${
        typeof watchers === 'string' ? `, after: "${watchers}"` : ''
      }) {
    nodes {
      ...userFields
    }
    pageInfo {
      ...pageInfoFields
    }
    totalCount
  }`
    : ''
  const pushedAtSchema = pushedAt ? 'pushedAt' : ''

  return `${repositorySchema} {${[
    nameSchema,
    homepageUrlSchema,
    forkCountSchema,
    collaboratorsSchema,
    stargazersScheme,
    watchersScheme,
    pushedAtSchema
  ].join('\n')}
}`
}
