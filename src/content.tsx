import React from 'react'
import ReactDOM from 'react-dom'

// TODO 注入绑定 GitHub Key 的输入框
function Home() {
  alert('github index')
  const [, list] = document.getElementsByClassName('dashboard-sidebar')
  const Li = document.createElement('li')
  Li.id = 'repo_dashboard_index--li'
  list?.appendChild(Li)
  ReactDOM.render(<span>123</span>, Li)
}

/** TODO
 * - [ ]  仓库页面（当前忽略 etag 优化缓存，使用 IndexedDB 存储页面数据）
 *   - [ ]  开始同步数据时间 & 同步数据进度
 *   - [ ]  上次同步数据时间（空则不限时）& 同步 reps 数据按钮 & 查看数据按钮
 * - [ ]  展示数据分析弹窗：用户分析图表
 *   - [ ]  低质量用户
 *   - [ ]  活跃用户
 *   - [ ]  生成用户年限分布饼图，地域分布图，活跃频次分布，follow，watch，starred 柱状图
 */
function Reps() {
  alert(`github reps ${window.location.href}`)
  const [list] = document.getElementsByClassName('pagehead-actions')
  const Li = document.createElement('li')
  Li.id = 'repo_dashboard_reps--li'
  list?.appendChild(Li)
  ReactDOM.render(<span>123</span>, Li)
}

if (window.location.href === 'github.com') {
  Home()
} else {
  Reps()
}
