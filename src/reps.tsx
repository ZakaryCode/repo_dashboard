import React from 'react'
import ReactDOM from 'react-dom'

import RepoDialog from './components/repo-dialog'
import RepoMenu from './components/repo-menu'
import { useGithubToken } from './utils/github'

export function waitReps() {
  const d = document.querySelector('meta[name=github-keyboard-shortcuts]')
  if (d) {
    if (d.getAttribute('content')?.includes('repository')) {
      // 仓库主页
      Reps()
    }
  } else {
    setTimeout(() => {
      waitReps()
    }, 1000)
  }
}

/** TODO
 * - [ ]  展示数据分析弹窗：用户分析图表
 *   - [ ]  低质量用户
 *   - [ ]  活跃用户
 *   - [ ]  生成用户年限分布饼图，地域分布图，活跃频次分布，follow，watch，starred 柱状图
 */
export default function Reps() {
  const [list] = document.getElementsByClassName('pagehead-actions')
  if (list) {
    const ButtonWrapper = document.createElement('li')
    ButtonWrapper.id = 'repo_dashboard_reps--li'
    list.appendChild(ButtonWrapper)
    function Button() {
      const {
        token,
        viewer,
        handleGithubSync,
        isSyncing,
        repoData,
        process
      } = useGithubToken()

      return (
        <notifications-list-subscription-form class="f5 position-relative d-flex">
          <details
            className="details-reset details-overlay f5 position-relative"
            data-target="notifications-list-subscription-form.details"
            data-action="toggle:notifications-list-subscription-form#detailsToggled"
          >
            <summary
              className="btn btn-sm"
              aria-label="Notifications settings"
              role="button"
              aria-haspopup="menu"
            >
              <span>DashBoard</span>
              <span className="dropdown-caret" />
            </summary>
            <RepoMenu
              token={token}
              viewer={viewer}
              handleGithubSync={handleGithubSync}
              isSyncing={isSyncing}
              repoData={repoData}
              process={process}
            />
            <RepoDialog repoData={repoData} />
            <div className="notifications-component-dialog-overlay" />
          </details>
        </notifications-list-subscription-form>
      )
    }

    ReactDOM.render(<Button />, ButtonWrapper)
  } else {
    setTimeout(() => {
      Reps()
    }, 1000)
  }
}
