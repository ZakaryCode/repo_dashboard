export function getQuery(
  search = window.location.search || ''
): Record<string, string | string[]> {
  const query = search.substr(1).split('&')
  return query.reduce((q, e) => {
    const [k, v] = e.split('=')
    const key = decodeURIComponent(k)
    const value = decodeURIComponent(v)
    if (q[key]) {
      if (q[key] instanceof Array) {
        q[key].push(value)
      } else {
        q[key] = [q[key], value]
      }
    } else {
      q[key] = value
    }
    return q
  }, {})
}

export function rmQuery(keys: string[]) {
  const search = window.location.search || ''
  const query = search
    .substr(1)
    .split('&')
    .filter((e) => {
      const key = decodeURIComponent(e.split('=')[0])
      return keys.every((k) => key !== k)
    })
  const q = `?${query.join('&')}`
  if (q.length < search.length) {
    window.location.search = q
  }
}
