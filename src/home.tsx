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
          </h2>
          <div className="dashboard-settings-token mt-2">
            <input
              type="text"
              placeholder="enter access token"
              className="form-control input-block"
              value={token}
              onChange={(e) => {
                setToken(e.target.value)
              }}
            />
            <a
              className="dashboard-settings-token-create"
              target="_blank"
              tabIndex={-1}
              href="/settings/tokens/new?scopes=repo&amp;description=Dashboard%20browser%20extension"
            >
              <svg
                className="icon"
                viewBox="0 0 1024 1024"
                version="1.1"
                xmlns="http://www.w3.org/2000/svg"
                p-id="2163"
                width="16"
                height="16"
              >
                <path
                  d="M507.733333 469.333333H938.666667v170.837334c0 23.296-19.2 42.496-42.666667 42.496s-42.666667-19.2-42.666667-42.496V554.666667h-85.333333v85.333333c0 23.466667-19.2 42.666667-42.666667 42.666667s-42.666667-19.2-42.666666-42.666667v-85.333333h-174.933334A213.418667 213.418667 0 0 1 85.333333 512a213.333333 213.333333 0 0 1 422.4-42.666667zM298.666667 640a128 128 0 1 0 0-256 128 128 0 0 0 0 256z"
                  fill="#AAAAAA"
                  p-id="2164"
                ></path>
              </svg>
            </a>
          </div>
          <button
            className="dashboard-settings-token-apply btn btn-sm btn-primary text-white mb-3"
            onClick={handleApply}
          >
            Apply
          </button>
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
