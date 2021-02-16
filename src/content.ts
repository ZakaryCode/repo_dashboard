import Home from './home'
import { waitReps } from './reps'

if (window.location.pathname === '/') {
  // Github 首页注入绑定 Key 的输入框
  Home()
} else {
  waitReps()
}
