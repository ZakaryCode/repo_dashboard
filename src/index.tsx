// TODO 注入绑定 GitHub Key 的输入框

import React from 'react'
import ReactDOM from 'react-dom'

(() => {
  debugger
  alert('github index')
  const [, list] = document.getElementsByClassName('dashboard-sidebar')
  const li = document.createElement('li')
  li.id = 'repo_dashboard_li'
  list.appendChild(li)
  const Button = <li>123</li>
  ReactDOM.render(Button, li)
})()
