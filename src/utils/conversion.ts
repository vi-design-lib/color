// noinspection JSUnusedGlobalSymbols

import type {
  HexColor,
  HslColor,
  HSLObject,
  RgbaColor,
  RGBAObject,
  RgbColor,
  RGBObject
} from '../types.js'

/**
 * HSL转RGB辅助函数
 *
 * @param { HexColor } hex - 十六进制颜色值，不支持 透明度，`#`可选
 * @returns {RGBObject} - RGB对象
 * @throws {TypeError} - 如果输入不是合法的HEX颜色值
 */
export function hexToRgb(hex: string): RGBObject {
  // 验证输入颜色值是否有效
  if (!/^#[0-9A-Fa-f]{6}$/.test(hex)) {
    throw new Error('Invalid primary color format')
  }
  // 去掉前导的 #
  let hexBody = hex.replace(/^#/, '')
  // 如果是简写的形式（如 #000 或 #abc），将其扩展为6位
  if (hexBody.length === 3) {
    hexBody = hexBody
      .split('')
      .map((x) => x + x)
      .join('')
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
 * @returns { RGBAObject } - RGBA对象
 * @throws {TypeError} - 如果输入不是合法的HEX颜色值
 */
export function hexToRgba(hex: string): RGBAObject {
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
 * @param { RGBObject } rgb - RGB对象
 * @returns { RgbColor } - RGB字符串
 */
export function rgbToString(rgb: RGBObject): RgbColor {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 * Rgba对象转为字符串
 *
 * @param { RGBAObject } rgba
 * @returns { RgbaColor } - RGBA字符串
 */
export function rgbaToString(rgba: RGBAObject): RgbaColor {
  return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`
}

/**
 *  RGB转HSL辅助函数
 *
 * @param { RGBObject | RgbColor } rgb - RGB对象
 * @returns { HSLObject } - HSL对象
 */
export function rgbToHsl(rgb: RGBObject | RgbColor): HSLObject {
  if (typeof rgb === 'string') rgb = rgbStringToObj(rgb)
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
 * @param { HexColor } hex - 十六进制颜色值
 * @returns { HSLObject } - HSL对象
 */
export function hexToHsl(hex: string): HSLObject {
  return rgbToHsl(hexToRgb(hex))
}

/**
 * HSL 转 RGB
 *
 * @param { HSLObject } hsl - HSL对象
 * @returns { RGBObject } - RGB颜色值
 */
export function hslToRgb(hsl: HSLObject): RGBObject {
  // 输入验证
  if (typeof hsl !== 'object' || hsl === null || !('h' in hsl) || !('s' in hsl) || !('l' in hsl)) {
    throw new Error('Invalid HSL object')
  }

  let { h, s, l } = hsl

  // 确保色相在 [0, 360) 范围内，处理负数
  h = ((h % 360) + 360) % 360

  // 饱和度和亮度限制在 [0, 1] 范围内
  s = Math.min(1, Math.max(0, s))
  l = Math.min(1, Math.max(0, l))

  const c = (1 - Math.abs(2 * l - 1)) * s // 计算色彩的强度
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1)) // 中间色
  const m = l - c / 2 // 明度的偏移量

  let r, g, b

  // 使用数组和索引简化区间判断逻辑
  const hueSector = Math.floor(h / 60)
  const colorValues = [c, x, 0]
  switch (hueSector) {
    case 0:
      ;[r, g, b] = [colorValues[0], colorValues[1], colorValues[2]]
      break
    case 1:
      ;[r, g, b] = [colorValues[1], colorValues[0], colorValues[2]]
      break
    case 2:
      ;[r, g, b] = [colorValues[2], colorValues[0], colorValues[1]]
      break
    case 3:
      ;[r, g, b] = [colorValues[2], colorValues[1], colorValues[0]]
      break
    case 4:
      ;[r, g, b] = [colorValues[1], colorValues[2], colorValues[0]]
      break
    default:
      ;[r, g, b] = [colorValues[0], colorValues[2], colorValues[1]]
      break
  }

  // 加上亮度偏移并转换为整数
  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return { r, g, b }
}

/**
 * hsl 转 hex
 *
 * @param { HSLObject } hsl - HSL对象
 * @returns { HexColor } - 十六进制颜色值
 */
export function hslToHex(hsl: HSLObject): HexColor {
  const rgb = hslToRgb(hsl)
  return rgbToHex(rgb)
}

/**
 * rgb 转 hex
 *
 * @param { RGBObject } rgb - RGB对象
 * @returns { HexColor } - 十六进制颜色值
 */
export function rgbToHex(rgb: RGBObject): HexColor {
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
 * @returns { RGBObject } - RGB对象
 */
export function rgbStringToObj(rgbString: string): RGBObject {
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
 * @param { RgbColor | HexColor } color
 * @returns {RGBObject} rgb对象
 */
export function colorToRgbObj(color: RgbColor | HexColor | string): RGBObject {
  try {
    if (color.startsWith('rgb')) {
      return rgbStringToObj(color)
    } else {
      return hexToRgb(color)
    }
  } catch (e) {
    throw new TypeError('Invalid color format')
  }
}

/**
 * HSL对象转字符串
 *
 * @param { HSLObject } hsl
 * @returns {HslColor}
 */
export function hslToString(hsl: HSLObject): HslColor {
  return `hsl(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%)`
}

/**
 * 颜色转HSL对象
 *
 * @param { RgbColor | HexColor } color - 颜色字符串，支持rgb和hex格式
 * @returns { HSLObject } - HSL对象
 */
export function colorToHexObj(color: string): HSLObject {
  return rgbToHsl(colorToRgbObj(color))
}
