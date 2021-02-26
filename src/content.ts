// import Home from './home'
import { waitReps } from './reps'

const _warn = console.warn

const logDeprecatedError = (key, xKey, yKey) =>
  `DEPRECATED: '${key}' has been deprecated. use '${xKey}', '${yKey}' instead`
const block = [
  logDeprecatedError('position', 'x', 'y'),
  logDeprecatedError('scale', 'scaleX', 'scaleY'),
  logDeprecatedError('origin', 'originX', 'originY')
]

console.warn = function (...args) {
  if (block.some((e) => e === args[0])) {
    return
  }
  return _warn.apply(console, args)
}

if (window.location.pathname === '/') {
  // Github 首页注入绑定 Key 的输入框
  // Home()
} else {
  waitReps()
}
