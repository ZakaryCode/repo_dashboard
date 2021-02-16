/** TODO
 * - [ ]  仓库页面（当前忽略 etag 优化缓存，使用 IndexedDB 存储页面数据）
 *   - [ ]  开始同步数据时间 & 同步数据进度
 *   - [ ]  上次同步数据时间（空则不限时）& 同步 reps 数据按钮 & 查看数据按钮
 * - [ ]  展示数据分析弹窗：用户分析图表
 *   - [ ]  低质量用户
 *   - [ ]  活跃用户
 *   - [ ]  生成用户年限分布饼图，地域分布图，活跃频次分布，follow，watch，starred 柱状图
 */

(() => {
  debugger
  alert(`github reps ${window.location.href}`)
  const [list] = document.getElementsByClassName('pagehead-actions')
  const li = document.createElement('li')
  li.id = 'repo_dashboard_li'
  list.appendChild(li)
  const Button = <li>123</li>
  ReactDOM.render(Button, li)
})()
