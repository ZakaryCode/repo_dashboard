export const pageInfoFields = `
fragment pageInfoFields on PageInfo {
  endCursor
  hasNextPage
  hasPreviousPage
  startCursor
}`

export const userFields = `
fragment userFields on User {
  anyPinnableItems
  avatarUrl
  bio
  commitComments {
    totalCount
  }
  company
  createdAt
  databaseId
  email
  followers {
    totalCount
  }
  hasSponsorsListing
  isBountyHunter
  isCampusExpert
  isDeveloperProgramMember
  isEmployee
  isHireable
  isSiteAdmin
  issues {
    totalCount
  }
  location
  login
  name
  pullRequests {
    totalCount
  }
  starredRepositories {
    totalCount
  }
  twitterUsername
  updatedAt
  watching {
    totalCount
  }
  websiteUrl
}`
