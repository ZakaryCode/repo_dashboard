export function parseDate(d: number) {
  const date = new Date(d * 1000)
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
}

export function getCurrentDate() {
  return Math.floor(new Date().getTime() / 1000)
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
