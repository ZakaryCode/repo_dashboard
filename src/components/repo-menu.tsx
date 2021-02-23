import React, { Fragment, useCallback } from 'react'

import { clientId, scope } from '../constants'
import { parseDate } from '../utils/time'

interface IMenuProps {
  token: string | null
  viewer: string
  handleGithubSync: (owner: string, name: string) => Promise<void>
  isSyncing: boolean
  repoData
  process: [number, number]
}

function RepoMenu({
  token,
  viewer,
  handleGithubSync,
  isSyncing,
  repoData,
  process = [0, 0]
}: IMenuProps) {
  const LoginUrl = `https://github.com/login/oauth/authorize?scope=${scope.join(
    ','
  )}&client_id=${clientId}&redirect_uri=${window.location.href}`
  const handleLogin = useCallback(() => {
    window.open(LoginUrl)
  }, [])
  const handleSync = useCallback(() => {
    const pathname = window.location.pathname.replace(/^\//, '')
    const [owner, name] = pathname.split('/')
    handleGithubSync(owner, name)
  }, [handleGithubSync])

  return (
    <details-menu
      class="SelectMenu dashboard-settings-menu"
      data-target="notifications-list-subscription-form.menu"
      role="menu"
    >
      <div className="SelectMenu-modal dashboard-settings-menu">
        <header className="SelectMenu-header">
          <h3 className="SelectMenu-title">Oak Board</h3>
          <button
            className="SelectMenu-closeButton"
            type="button"
            data-action="click:notifications-list-subscription-form#closeMenu"
            aria-label="Close menu"
          >
            <svg
              className="octicon octicon-x"
              viewBox="0 0 16 16"
              version="1.1"
              width="16"
              height="16"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M3.72 3.72a.75.75 0 011.06 0L8 6.94l3.22-3.22a.75.75 0 111.06 1.06L9.06 8l3.22 3.22a.75.75 0 11-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 01-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 010-1.06z"
              />
            </svg>
          </button>
        </header>
        <div className="SelectMenu-list">
          <button
            className="SelectMenu-item flex-items-start"
            onClick={handleLogin}
          >
            <div>
              <div className="f5 text-bold">
                {token && viewer
                  ? `Logged in as ${viewer}`
                  : 'Connect to Github'}
              </div>
              <div className="text-small text-gray text-normal pb-1">
                {token && viewer ? 'Click to refresh token.' : ''}
              </div>
            </div>
          </button>
          {token && viewer && (
            <button
              className="SelectMenu-item flex-items-start"
              onClick={handleSync}
            >
              <div style={{ width: '100%' }}>
                <div className="f5 text-bold">
                  {isSyncing ? 'Syncing...' : 'Sync'}
                </div>
                <div className="text-small text-gray text-normal pb-1">
                  Synchronize current repository data.
                  {isSyncing && (
                    <Fragment>
                      <span style={{ color: 'red' }}>
                        Please don&apos;t close this Window when is syncing!
                      </span>
                      <progress
                        className="oka-board-loading"
                        style={{ width: '100%' }}
                        value={process[0]}
                        max={process[1]}
                      />
                    </Fragment>
                  )}
                </div>
              </div>
            </button>
          )}
          {repoData && (
            <button
              className="SelectMenu-item flex-items-start pr-3"
              type="button"
              data-target="notifications-list-subscription-form.customButton"
              data-action="click:notifications-list-subscription-form#openCustomDialog"
              aria-haspopup="true"
            >
              <div>
                <div className="d-flex flex-items-start flex-justify-between">
                  <div className="f5 text-bold">Board</div>
                  <div className="f5 pr-1">
                    <svg
                      className="octicon octicon-arrow-right"
                      height="16"
                      viewBox="0 0 16 16"
                      version="1.1"
                      width="16"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.22 2.97a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06l2.97-2.97H3.75a.75.75 0 010-1.5h7.44L8.22 4.03a.75.75 0 010-1.06z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="text-small text-gray text-normal pb-1">
                  Display the data analysis chart in this repository (Last data
                  update time {parseDate(repoData.updateAt)}).
                </div>
              </div>
            </button>
          )}
        </div>
      </div>
    </details-menu>
  )
}

export default RepoMenu
