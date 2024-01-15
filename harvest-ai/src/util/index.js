export const convertSnakeToCamelInObject = (obj) => {
  if (typeof obj !== 'object') return obj
  if (Array.isArray(obj)) return obj.map(convertSnakeToCamelInObject)
  return Object.keys(obj).reduce((acc, key) => {
    const camelKey = key.replace(/([-_][a-z])/gi, ($1) =>
      $1.toUpperCase().replace('_', '')
    )
    const value = obj[key]
    acc[camelKey] = convertSnakeToCamelInObject(value)
    return acc
  }, {})
}

export const formatMoney = (value) => {
  if (typeof value !== 'number') return value
  return Number(value).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
  })
}
