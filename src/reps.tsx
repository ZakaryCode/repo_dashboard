import React from 'react'
import ReactDOM from 'react-dom'

export function waitReps () {
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
    const Li = document.createElement('li')
    Li.id = 'repo_dashboard_reps--li'
    list?.appendChild(Li)
    ReactDOM.render(<span>123</span>, Li)
  } else {
    setTimeout(() => {
      Reps()
    }, 1000)
  }
}
