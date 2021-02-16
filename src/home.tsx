import React, { useCallback, useEffect, useState } from 'react'
import ReactDOM from 'react-dom'

import { tokenName } from './constants'

export default function Home() {
  const [, list] = document.getElementsByClassName('dashboard-sidebar')
  const BoardWrapper = document.createElement('div')
  BoardWrapper.id = 'repo_dashboard_index--li'
  BoardWrapper.className = 'js-repos-container mb-3"'
  if (list) {
    list.appendChild(BoardWrapper)
    // TODO 判断是否有 Key 并展示
    function Board() {
      const [token, setToken] = useState('')
      const handleApply = useCallback(() => {
        localStorage.setItem(tokenName, token)
      }, [token])
      useEffect(() => {
        const t = localStorage.getItem(tokenName)
        setToken(t || '')
      }, [])
      return (
        <div className="Details js-repos-container dashboard-settings-token-wrapper">
          <h2 className="hide-sm hide-md f5 mb-1 border-top color-border-secondary pt-3 f4 d-flex flex-justify-between flex-items-center">
            DashBoard Token
            <a
              className="btn btn-sm btn-primary text-white dashboard-settings-token-create"
              target="_blank"
              tabIndex={-1}
              href="/settings/tokens/new?scopes=repo&amp;description=Dashboard%20browser%20extension"
            >
              new
            </a>
          </h2>
          <div className="dashboard-settings-token mt-2 mb-3">
            <input
              type="text"
              placeholder="enter access token"
              className="form-control input-block"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
              }}
            />
            <button
              className="btn btn-sm btn-primary text-white dashboard-settings-token-apply"
              onClick={handleApply}
            >
              Apply
            </button>
          </div>
        </div>
      )
    }

    ReactDOM.render(<Board />, BoardWrapper)
  } else {
    setTimeout(() => {
      Home()
    }, 1000)
  }
}
