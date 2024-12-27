import type { AnyColor, ColorTag } from '../types.js'
import { anyColorToHexColor } from './conversion.js'

/**
 * 输出带有颜色的键值对对象到控制台
 *
 * @param {Record<string, string>} colors - 键值对对象，键为颜色名称，值为颜色值（HEX颜色）
 */
export function logColorsWithLabels(colors: Record<string, AnyColor>): void {
  // 判断当前环境是否是浏览器
  const isBrowser = typeof window !== 'undefined'

  if (!isBrowser) {
    // 非浏览器环境，使用 ANSI 颜色代码
    const hexToAnsi = (hex: string): string => {
      // 去除 '#' 符号并解析 RGB
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)

      // 计算最接近的 ANSI 颜色（0-15）
      const ansiColor =
        16 +
        Math.round((r / 255) * 5) * 36 +
        Math.round((g / 255) * 5) * 6 +
        Math.round((b / 255) * 5)
      return `\x1b[38;5;${ansiColor}m` // ANSI 转义码
    }

    // 在终端中输出颜色
    Object.entries(colors).forEach(([key, color]) => {
      color = anyColorToHexColor(color)
      // 获取颜色对应的 ANSI 代码
      const ansiColor = hexToAnsi(color)
      // 输出带有颜色的键值对
      console.log(`${ansiColor}${key}: ${color}\x1b[0m`) // \x1b[0m 用于重置颜色
    })
  } else {
    // 浏览器环境，使用 console.log 和 CSS 样式
    console.group()
    Object.entries(colors).forEach(([key, color]) => {
      color = anyColorToHexColor(color)
      // 输出颜色标签和对应的颜色
      console.log(`%c${key}: ${color}`, `color: ${color}; font-weight: bold;`)
    })
    console.groupEnd()
  }
}

/**
 * 获取色彩类型
 *
 * @param {string | object} color - 颜色值，可以是字符串或对象
 * @returns {string} - 颜色类型，可以是 `hex`、`rgb` 、`hsl` 、`HSL`、`RGB`，大写为对象类型
 * @throws {Error} - 如果颜色格式无效，则抛出错误
 */
export function getColorType(color: any): ColorTag {
  if (typeof color === 'string') {
    if (color.startsWith('#')) return 'hex'
    if (color.startsWith('rgb')) return 'rgb'
    if (color.startsWith('hsl')) return 'hsl'
    throw new Error('Invalid color string format')
  } else if (typeof color === 'object' && color !== null) {
    if ('h' in color && 's' in color && 'l' in color) return 'HSL'
    if ('r' in color && 'g' in color && 'b' in color) return 'RGB'
    throw new Error('Invalid color object format')
  }
  throw new Error('Invalid color format')
}

/**
 * 字符串首字母转大写
 *
 * @param {string} str - 需要转大写的字符串
 */
export function capitalize(str: string): string {
  if (str.length === 0) return str
  return str.charAt(0).toUpperCase() + str.slice(1)
}
