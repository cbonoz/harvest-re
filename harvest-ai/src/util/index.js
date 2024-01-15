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

export function gradientColor(index, max) {
  // Normalize index to be between 0 and 1
  const normalizedIndex = index / max

  // Map normalized index to a hue value between 120 (green) and 0 (red)
  const hue = (1 - normalizedIndex) * 120

  // Convert HSL to RGB
  const h = hue / 360
  const s = 1
  const l = 0.5

  let r, g, b

  if (s == 0) {
    r = g = b = l // achromatic
  } else {
    const hue2rgb = function hue2rgb(p, q, t) {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q

    r = Math.round(hue2rgb(p, q, h + 1 / 3) * 255)
    g = Math.round(hue2rgb(p, q, h) * 255)
    b = Math.round(hue2rgb(p, q, h - 1 / 3) * 255)
  }

  // Convert RGB to hexadecimal format
  const hexColor = componentToHex(r) + componentToHex(g) + componentToHex(b)

  return hexColor
}

function componentToHex(c) {
  const hex = c.toString(16)
  return hex.length == 1 ? '0' + hex : hex
}
