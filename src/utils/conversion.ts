import type {
  AnyColor,
  ColorTag,
  ColorTagToColorType,
  HexColor,
  HslColor,
  HSLObject,
  RgbColor,
  RGBObject,
  StringColors
} from '../types.js'
import { getColorType } from './tools.js'

/**
 * HSL转RGB辅助函数
 *
 * @param { HexColor } hex - 十六进制颜色值，不支持 透明度，`#`可选
 * @returns {RGBObject} - RGB对象
 * @throws {TypeError} - 如果输入不是合法的HEX颜色值
 */
export function hexToRgbObject(hex: string): RGBObject {
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
 * HEX 转 HSL
 *
 * @param { HexColor } hex - 十六进制颜色值
 * @returns { HSLObject } - HSL对象
 */
export function hexToHslObject(hex: string): HSLObject {
  return rgbToHslObject(hexToRgbObject(hex))
}

/**
 * Rgb对象转为字符串
 *
 * @param { RGBObject } rgb - RGB对象
 * @returns { RgbColor } - RGB字符串
 */
export function rgbObjectToColor(rgb: RGBObject): RgbColor {
  return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
}

/**
 *  RGB转HSL辅助函数
 *
 * @param { RGBObject | RgbColor } rgb - RGB对象或rgb字符串
 * @returns { HSLObject } - HSL对象
 */
export function rgbToHslObject(rgb: RGBObject | RgbColor): HSLObject {
  if (typeof rgb === 'string') rgb = rgbColorToObj(rgb)
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
 * rgb 转 hex
 *
 * @param { RGBObject } rgb - RGB对象
 * @returns { HexColor } - 十六进制颜色值
 */
export function rgbObjectToHexColor(rgb: RGBObject): HexColor {
  let { r, g, b } = rgb
  r = r < 0 ? 0 : r > 255 ? 255 : r
  g = g < 0 ? 0 : g > 255 ? 255 : g
  b = b < 0 ? 0 : b > 255 ? 255 : b
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1).toUpperCase()}`
}

/**
 * HSL 转 RGB
 *
 * @param { HSLObject } hsl - HSL对象
 * @returns { RGBObject } - RGB颜色对象
 */
export function hslToRgbObject(hsl: HSLObject | HslColor): RGBObject {
  if (typeof hsl === 'string') {
    hsl = hslColorToObj(hsl)
  } else if (
    typeof hsl !== 'object' ||
    hsl === null ||
    !('h' in hsl) ||
    !('s' in hsl) ||
    !('l' in hsl)
  ) {
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
export function hslObjectToHexColor(hsl: HSLObject): HexColor {
  const rgb = hslToRgbObject(hsl)
  return rgbObjectToHexColor(rgb)
}

/**
 * hsl对象 转 rgb字符串颜色
 *
 * @param { HSLObject } hsl - HSL对象
 * @returns { RgbColor } - RGB字符串
 */
export function hslObjectToRgbColor(hsl: HSLObject): RgbColor {
  const rgb = hslToRgbObject(hsl)
  return rgbObjectToColor(rgb)
}

/**
 * rgb字符串转为rgb对象
 *
 * @param { RgbColor } rgbString
 * @returns { RGBObject } - RGB对象
 */
export function rgbColorToObj(rgbString: string): RGBObject {
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
 * @param { RgbColor | HexColor | HslColor } color - 颜色字符串，支持rgb、hex、hsl格式
 * @returns {RGBObject} rgb对象
 */
export function colorToRgbObj(color: StringColors): RGBObject {
  try {
    if (color.startsWith('rgb')) {
      return rgbColorToObj(color)
    } else if (color.startsWith('hsl')) {
      return hslToRgbObject(color as HslColor)
    } else {
      return hexToRgbObject(color)
    }
  } catch (e) {
    throw new TypeError('Invalid color format')
  }
}

/**
 * hsl颜色转对象
 *
 * @param {HslColor} color - HSL颜色字符串
 * @returns {HSLObject} - HSL对象
 */
export function hslColorToObj(color: HslColor): HSLObject {
  const match = color.match(/^hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)$/)
  if (!match) {
    throw new Error('Invalid HSL string format')
  }
  return {
    h: parseInt(match[1], 10),
    s: parseInt(match[2], 10) / 100,
    l: parseInt(match[3], 10) / 100
  }
}

/**
 * HSL对象转字符串
 *
 * @param { HSLObject } hsl
 * @returns {HslColor}
 */
export function hslObjectToColor(hsl: HSLObject): HslColor {
  return `hsl(${hsl.h}, ${hsl.s * 100}%, ${hsl.l * 100}%)`
}

/**
 * 任意颜色类型转HSL对象
 *
 * @param { any } color - 任意颜色，可以是对象类型也可以是字符串类型
 * @param { ColorTag } [type] - 颜色类型，如果没有传入则会自动识别颜色类型
 * @returns { HSLObject } - HSL对象
 */
export function anyColorToHslObject(color: any, type?: ColorTag): HSLObject {
  const colorType = type ?? getColorType(color)
  switch (colorType) {
    case 'hex':
      return hexToHslObject(color)
    case 'RGB':
    case 'rgb':
      return rgbToHslObject(color)
    case 'hsl':
      return hslColorToObj(color)
    case 'HSL':
      return color
    default:
      throw new Error(`Invalid color type: ${type}`)
  }
}

/**
 * 任意颜色类型转RGB对象
 *
 * @param { any } color - 任意颜色，可以是对象类型也可以是字符串类型
 * @param { ColorTag } [type] - 颜色类型，如果没有传入则会自动识别颜色类型
 * @returns { RGBObject } - RGB对象
 */
export function anyColorToRgbObject(color: any, type?: ColorTag): RGBObject {
  const colorType = type ?? getColorType(color)
  switch (colorType) {
    case 'hex':
      return hexToRgbObject(color)
    case 'rgb':
      return rgbColorToObj(color)
    case 'RGB':
      return color
    case 'HSL':
    case 'hsl':
      return hslToRgbObject(color)
    default:
      throw new Error(`Invalid color type: ${type}`)
  }
}

/**
 * 任意颜色类型转Hex颜色
 *
 * @param { any } color - 任意颜色，可以是对象类型也可以是字符串类型
 * @param { ColorTag } [type] - 颜色类型，如果没有传入则会自动识别颜色类型
 * @returns { HexColor } - 十六进制颜色值
 */
export function anyColorToHexColor(color: any, type?: ColorTag): HexColor {
  const colorType = type ?? getColorType(color)
  switch (colorType) {
    case 'hex':
      return color
    case 'rgb':
      return rgbObjectToHexColor(rgbColorToObj(color))
    case 'RGB':
      return rgbObjectToHexColor(color)
    case 'hsl':
      return hslObjectToHexColor(hslColorToObj(color))
    case 'HSL':
      return hslObjectToHexColor(color)
    default:
      throw new Error(`Invalid color type: ${type}`)
  }
}

/**
 * 任意颜色类型转Hex颜色
 *
 * @param { any } color - 任意颜色，可以是对象类型也可以是字符串类型
 * @param { ColorTag } [type] - 颜色类型，如果没有传入则会自动识别颜色类型
 * @returns { HexColor } - 十六进制颜色值
 */
export function anyColorToRgbColor(color: any, type?: ColorTag): RgbColor {
  const colorType = type ?? getColorType(color)
  switch (colorType) {
    case 'hex':
      return rgbObjectToColor(hexToRgbObject(color))
    case 'rgb':
      return color
    case 'RGB':
      return rgbObjectToColor(color)
    case 'hsl':
      return hslObjectToRgbColor(hslColorToObj(color))
    case 'HSL':
      return hslObjectToRgbColor(color)
    default:
      throw new Error(`Invalid color type: ${type}`)
  }
}

/**
 * 任意颜色类型转Hsl字符串颜色
 *
 *
 * @param { any } color - 任意颜色，可以是对象类型也可以是字符串类型
 * @param { ColorTag } [type] - 颜色类型，如果没有传入则会自动识别颜色类型
 * @returns { HslColor } - HSL字符串颜色
 */
export function anyColorToHslColor(color: any, type?: ColorTag): HslColor {
  const colorType = type ?? getColorType(color)
  switch (colorType) {
    case 'hex':
      return hslObjectToColor(hexToHslObject(color))
    case 'rgb':
      return hslObjectToColor(rgbToHslObject(rgbColorToObj(color)))
    case 'RGB':
      return hslObjectToColor(rgbToHslObject(color))
    case 'hsl':
      return color
    case 'HSL':
      return hslObjectToColor(color)
    default:
      throw new Error(`Invalid color type: ${type}`)
  }
}

/**
 * 任意颜色类型转目标颜色
 *
 * @template T 目标颜色类型标签
 * @param {AnyColor} source - 源颜色
 * @param {T} target - 目标颜色
 * @param {ColorTag} [sourceType] - 源颜色类型，不传入会自动获取
 */
export function anyColorToTargetColor<T extends ColorTag>(
  source: AnyColor,
  target: T,
  sourceType?: ColorTag
): ColorTagToColorType<T> {
  sourceType = sourceType ?? getColorType(source)
  switch (target) {
    case 'hex':
      return anyColorToHexColor(source, sourceType) as any
    case 'rgb':
      return anyColorToRgbColor(source, sourceType) as any
    case 'hsl':
      return anyColorToHslColor(source, sourceType) as any
    case 'RGB':
      return anyColorToRgbObject(source, sourceType) as any
    case 'HSL':
      return anyColorToHslObject(source, sourceType) as any
    default:
      throw new Error(`Invalid target type , ${target}`)
  }
}
