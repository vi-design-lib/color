import type { HexColor, RGBColor, RgbColor } from '../types.js'
import { colorToRgbObj, rgbToHex, rgbToString } from './conversion.js'

/**
 * 使颜色变亮
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {string} color
 * @param {number} percent - 亮度百分比 (0-100)
 * @returns {T} - 调整后的颜色
 */
export function lighten<T extends RgbColor | HexColor | RGBColor | string>(
  color: T,
  percent: number
): T {
  if (percent < 0 || percent > 100) {
    throw new Error('Percent must be between 0 and 100')
  }

  let { r, g, b } = typeof color === 'string' ? colorToRgbObj(color) : color

  // Handle boundary conditions
  r = Math.min(255, Math.round(r + (255 - r) * (percent / 100)))
  g = Math.min(255, Math.round(g + (255 - g) * (percent / 100)))
  b = Math.min(255, Math.round(b + (255 - b) * (percent / 100)))

  if (typeof color === 'object') return { r, g, b } as T

  try {
    return (color.startsWith('#') ? rgbToHex({ r, g, b }) : rgbToString({ r, g, b })) as T
  } catch (error) {
    throw new Error(`Failed to convert color: ${error}`)
  }
}

/**
 * 使颜色变暗
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} percent - 亮度百分比 (0-100)
 * @returns {T} - 调整后的颜色
 */
export function darken<T extends RgbColor | HexColor | RGBColor | string>(
  color: T,
  percent: number
): T {
  if (percent < 0 || percent > 100) {
    throw new Error('Percent must be between 0 and 100')
  }

  let { r, g, b } = typeof color === 'string' ? colorToRgbObj(color) : color

  // Handle boundary conditions
  r = Math.max(0, Math.round(r * (1 - percent / 100)))
  g = Math.max(0, Math.round(g * (1 - percent / 100)))
  b = Math.max(0, Math.round(b * (1 - percent / 100)))

  if (typeof color === 'object') return { r, g, b } as T

  try {
    return (color.startsWith('#') ? rgbToHex({ r, g, b }) : rgbToString({ r, g, b })) as T
  } catch (error) {
    throw new Error(`Failed to convert color: ${error}`)
  }
}
