// noinspection JSUnusedGlobalSymbols

export type HEXColor = `#${string}`
export type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number})`
export type RgbColor = `rgb(${number}, ${number}, ${number})`
export type RgbColorObj = { r: number; g: number; b: number }
export interface RgbaColorObj extends RgbColorObj {
  a: number
}

export type HSLColorObj = { h: number; s: number; l: number }

/**
 * HSL转RGB辅助函数
 *
 * @param { HEXColor } hex - 十六进制颜色值，不支持 透明度，`#`可选
 * @returns {RgbColorObj} - RGB对象
 * @throws {TypeError} - 如果输入不是合法的HEX颜色值
 */
export function hexToRgb(hex: string): RgbColorObj {
  // 去掉前导的 #
  let hexBody = hex.replace(/^#/, '')
  // 如果是简写的形式（如 #000 或 #abc），将其扩展为6位
  if (hexBody.length === 3) {
    hexBody = hexBody
      .split('')
      .map((x) => x + x)
      .join('')
  }
  // 确保hex长度为6位
  if (hexBody.length !== 6) {
    throw new TypeError('Invalid hex color')
  }
  // 解析为 RGB
  const r = parseInt(hexBody.slice(0, 2), 16)
  const g = parseInt(hexBody.slice(2, 4), 16)
  const b = parseInt(hexBody.slice(4, 6), 16)
  return { r, g, b }
}

/**
 * HEX转RGBA辅助函数
 *
 * @param {string} hex - 十六进制颜色值，支持透明度，`#`可选
 * @returns { RgbaColorObj } - RGBA对象
 * @throws {TypeError} - 如果输入不是合法的HEX颜色值
 */
export function hexToRgba(hex: string): RgbaColorObj {
  let r: number, g: number, b: number, a: number
  if (hex.length !== 9) {
    const rgb = hexToRgb(hex)
    r = rgb.r
    g = rgb.g
    b = rgb.b
    a = 1
  } else {
    // 去掉前导的 #
    let hexBody = hex.replace(/^#/, '')
    // 处理8位颜色（包括透明度）
    r = parseInt(hexBody.slice(0, 2), 16)
    g = parseInt(hexBody.slice(2, 4), 16)
    b = parseInt(hexBody.slice(4, 6), 16)
    a = parseInt(hexBody.slice(6, 8), 16) / 255 // 透明度转换为 0 到 1 的范围
  }
  return { r, g, b, a }
}

/**
 * Rgb对象转为字符串
 *
 * @param { RgbColorObj } rgb - RGB对象
 * @returns { RgbColor } - RGB字符串
 */
export function rgbToString(rgb: RgbColorObj): RgbColor {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 * Rgba对象转为字符串
 *
 * @param { RgbaColorObj } rgba
 * @returns { RgbaColor } - RGBA字符串
 */
export function rgbaToString(rgba: RgbaColorObj): RgbaColor {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

/**
 *  RGB转HSL辅助函数
 *
 * @param { RgbColorObj } rgb - RGB对象
 * @returns { HSLColorObj } - HSL对象
 */
export function rgbToHsl(rgb: RgbColorObj): HSLColorObj {
  let { r, g, b } = rgb
  r /= 255
  g /= 255
  b /= 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const diff = max - min

  let h = 0,
    s = 0,
    l = (max + min) / 2

  if (diff !== 0) {
    s = l > 0.5 ? diff / (2 - max - min) : diff / (max + min)
    if (max === r) {
      h = (g - b) / diff + (g < b ? 6 : 0)
    } else if (max === g) {
      h = (b - r) / diff + 2
    } else {
      h = (r - g) / diff + 4
    }
    h *= 60
  }
  // 保留小数点后两位
  h = Math.round(h * 100) / 100
  s = Math.round(s * 100) / 100
  l = Math.round(l * 100) / 100
  return { h, s, l }
}

/**
 * HEX 转 HSL
 *
 * @param { HEXColor } hex - 十六进制颜色值
 * @returns { HSLColorObj } - HSL对象
 */
export function hexToHsl(hex: string): HSLColorObj {
  const rgb = hexToRgb(hex)
  return rgbToHsl(rgb)
}

/**
 * HSL 转 HEX
 *
 * @param { HSLColorObj } hsl - HSL对象
 * @returns { HEXColor } - 十六进制颜色值
 */
export function hslToRgb(hsl: HSLColorObj): RgbColorObj {
  const { h, s, l } = hsl

  let r, g, b

  if (s === 0) {
    r = g = b = l // 消色差
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s
    const p = 2 * l - q
    /** 计算 RGB 分量 */
    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1
      if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    r = hue2rgb(p, q, h + 1 / 3)
    g = hue2rgb(p, q, h)
    b = hue2rgb(p, q, h - 1 / 3)
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255)
  }
}

/**
 * hsl 转 hex
 *
 * @param { HSLColorObj } hsl - HSL对象
 * @returns { HEXColor } - 十六进制颜色值
 */
export function hslToHex(hsl: HSLColorObj): HEXColor {
  const rgb = hslToRgb(hsl)
  return rgbToHex(rgb)
}

/**
 * rgb 转 hex
 *
 * @param { RgbColorObj } rgb - RGB对象
 * @returns { HEXColor } - 十六进制颜色值
 */
export function rgbToHex(rgb: RgbColorObj): HEXColor {
  let { r, g, b } = rgb
  r = r < 0 ? 0 : r > 255 ? 255 : r
  g = g < 0 ? 0 : g > 255 ? 255 : g
  b = b < 0 ? 0 : b > 255 ? 255 : b
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`
}

/**
 * rgb字符串转为rgb对象
 *
 * @param { RgbColor } rgbString
 * @returns { RgbColorObj } - RGB对象
 */
export function rgbStringToObj(rgbString: string): RgbColorObj {
  // 正则表达式匹配 rgb(r, g, b) 格式的字符串
  const match = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/)

  if (!match) {
    throw new Error('Invalid RGB string format')
  }

  // 提取匹配的数字并转换为整数
  const r = parseInt(match[1], 10)
  const g = parseInt(match[2], 10)
  const b = parseInt(match[3], 10)

  return { r, g, b }
}

/**
 * 字符串颜色转rgb对象
 *
 * @param { RgbColor | HEXColor } color
 * @returns {RgbColorObj} rgb对象
 */
export function colorToRgbObj(color: RgbColor | HEXColor): RgbColorObj {
  if (color.startsWith('rgb')) {
    return rgbStringToObj(color)
  } else {
    return hexToRgb(color)
  }
}
