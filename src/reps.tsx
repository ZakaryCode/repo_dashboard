import React from 'react'
import ReactDOM from 'react-dom'

import { clientId, scope } from './constants'

export function waitReps() {
  const d = document.querySelector('meta[name=github-keyboard-shortcuts]')
  if (d && d.getAttribute('content')?.includes('repository')) {
    // 仓库主页
    Reps()
  } else {
    waitReps()
  }
}

/** TODO
 * - [ ]  仓库页面（当前忽略 ETag 优化缓存，使用 IndexedDB 存储页面数据）
 *   - [ ]  开始同步数据时间 & 同步数据进度
 *   - [ ]  上次同步数据时间（空则不限时）& 同步 reps 数据按钮 & 查看数据按钮
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
      const LoginUrl = `https://github.com/login/oauth/authorize?scope=${scope.join(
        ','
      )}&client_id=${clientId}&redirect_uri=${window.location.href}`
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
            <details-menu
              class="SelectMenu dashboard-settings-menu"
              data-target="notifications-list-subscription-form.menu"
              role="menu"
            >
              <div className="SelectMenu-modal dashboard-settings-menu">
                <header className="SelectMenu-header">
                  <h3 className="SelectMenu-title">Github DashBoard</h3>
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
                  <form acceptCharset="UTF-8">
                    <input
                      type="hidden"
                      name="authenticity_token"
                      value="S33z+LG2UXBQn1NFx0d1PNgZI1glXhZjNRcorpRTJxsXXzDXwII/F1zfYnOcYq3FflzRafq1ZREUMESanRjuZA=="
                    />
                    <input
                      type="hidden"
                      name="repository_id"
                      value="128624453"
                    />
                    <a href={LoginUrl}>Login</a>
                    <button className="SelectMenu-item flex-items-start">
                      <div>
                        <div className="f5 text-bold">
                          Participating and @mentions
                        </div>
                        <div className="text-small text-gray text-normal pb-1">
                          Only receive notifications from this repository when
                          participating or @mentioned.
                        </div>
                      </div>
                    </button>
                    <button className="SelectMenu-item flex-items-start">
                      <div>
                        <div className="f5 text-bold">All Activity</div>
                        <div className="text-small text-gray text-normal pb-1">
                          Notified of all notifications on this repository.
                        </div>
                      </div>
                    </button>
                    <button className="SelectMenu-item flex-items-start">
                      <div>
                        <div className="f5 text-bold">Ignore</div>
                        <div className="text-small text-gray text-normal pb-1">
                          Never be notified.
                        </div>
                      </div>
                    </button>
                  </form>
                  <button
                    className="SelectMenu-item flex-items-start pr-3"
                    type="button"
                    data-target="notifications-list-subscription-form.customButton"
                    data-action="click:notifications-list-subscription-form#openCustomDialog"
                    aria-haspopup="true"
                  >
                    <div>
                      <div className="d-flex flex-items-start flex-justify-between">
                        <div className="f5 text-bold">Custom</div>
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
                        Select events you want to be notified of in addition to
                        participating and @mentions.
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </details-menu>
            <details-dialog
              class="notifications-component-dialog dashboard-settings-menu"
              data-target="notifications-list-subscription-form.customDialog"
              hidden
              role="dialog"
              aria-modal="true"
            >
              <div className="SelectMenu-modal notifications-component-dialog-modal overflow-visible">
                <form>
                  <input
                    type="hidden"
                    name="authenticity_token"
                    value="Yq0DcsD23U7xMYnspk3A5p6ivN5RVqRQi0kcJcu1s98+j8BdscKzKf1xuNr9aBgfOOdO74691yKqbnARwv56oA=="
                  />
                  <input type="hidden" name="repository_id" value="128624453" />
                  <header className="d-sm-none SelectMenu-header pb-0 border-bottom-0 px-2 px-sm-3">
                    <h1 className="f3 SelectMenu-title d-inline-flex">
                      <button
                        className="bg-white border-0 px-2 py-0 m-0 link-gray f5"
                        aria-label="Return to menu"
                        type="button"
                      >
                        <svg
                          className="octicon octicon-arrow-left"
                          height="16"
                          viewBox="0 0 16 16"
                          version="1.1"
                          width="16"
                          aria-hidden="true"
                        >
                          <path
                            fillRule="evenodd"
                            d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"
                          />
                        </svg>
                      </button>
                      Custom
                    </h1>
                  </header>

                  <header className="d-none d-sm-flex flex-items-start pt-1">
                    <button
                      className="border-0 px-2 pt-1 m-0 link-gray f5"
                      style={{ backgroundColor: 'transparent' }}
                      data-action="click:notifications-list-subscription-form#closeCustomDialog"
                      aria-label="Return to menu"
                      type="button"
                    >
                      <svg
                        style={{ position: 'relative', left: 2, top: 1 }}
                        className="octicon octicon-arrow-left"
                        height="16"
                        viewBox="0 0 16 16"
                        version="1.1"
                        width="16"
                        aria-hidden="true"
                      >
                        <path
                          fillRule="evenodd"
                          d="M7.78 12.53a.75.75 0 01-1.06 0L2.47 8.28a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L4.81 7h7.44a.75.75 0 010 1.5H4.81l2.97 2.97a.75.75 0 010 1.06z"
                        />
                      </svg>
                    </button>

                    <h1 className="pt-1 pr-4 pb-0 pl-0 f5 text-bold">Custom</h1>
                  </header>
                  <fieldset>
                    <legend>
                      <div className="text-small text-gray pt-0 pr-3 pb-3 pl-6 pl-sm-5 border-bottom mb-3">
                        Select events you want to be notified of in addition to
                        participating and @mentions.
                      </div>
                    </legend>
                    <div className="form-checkbox mr-3 ml-6 ml-sm-5 mb-2 mt-0">
                      <label className="f5 text-normal">
                        <input
                          type="checkbox"
                          name="thread_types[]"
                          value="Issue"
                        />
                        Issues
                      </label>
                    </div>
                    <div className="form-checkbox mr-3 ml-6 ml-sm-5 mb-2 mt-0">
                      <label className="f5 text-normal">
                        <input
                          type="checkbox"
                          name="thread_types[]"
                          value="PullRequest"
                        />
                        Pull requests
                      </label>
                    </div>
                    <div className="form-checkbox mr-3 ml-6 ml-sm-5 mb-2 mt-0">
                      <label className="f5 text-normal">
                        <input
                          type="checkbox"
                          name="thread_types[]"
                          value="Release"
                        />
                        Releases
                      </label>
                    </div>
                    <div className="form-checkbox mr-3 ml-6 ml-sm-5 mb-2 mt-0">
                      <label className="f5 text-normal">
                        <input
                          type="checkbox"
                          name="thread_types[]"
                          value="Discussion"
                        />
                        Discussions
                      </label>
                    </div>
                  </fieldset>
                  <div className="pt-2 pb-3 px-3 d-flex flex-justify-start flex-row-reverse">
                    <button className="btn btn-sm btn-primary ml-2" disabled>
                      Apply
                    </button>
                    <button className="btn btn-sm" type="button">
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </details-dialog>
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
