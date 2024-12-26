import type { HexColor, RgbColor, RGBObject } from '../types.js'
import { colorToRgbObj, hslToHex, hslToRgb, rgbToHsl, rgbToString } from './conversion.js'

/**
 * 调整颜色属性（亮度、饱和度或色相）
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} value - 调整的值，对于亮度和饱和度是比率 (-1到1)，对于色相是角度 (-360 到 360)
 * @param {string} property - 要调整的属性 ('l' 或 's' 或 'h')
 * @returns {T} - 调整后的颜色
 */
function adjustColorProperty<T extends RgbColor | HexColor | RGBObject | string>(
  color: T,
  value: number,
  property: 'l' | 's' | 'h'
): T {
  if ((property === 'l' || property === 's') && (value < -1 || value > 1)) {
    throw new Error('Value must be between -1 and 1 for brightness and saturation')
  }
  if (property === 'h' && (value < -360 || value > 360)) {
    throw new Error('Value must be between -360 and 360 for hue')
  }

  // 将颜色转换为 HSL
  let hsl = typeof color === 'string' ? rgbToHsl(colorToRgbObj(color)) : rgbToHsl(color)

  // 调整指定属性
  if (property === 'h') {
    const h = (hsl.h + value) % 360
    hsl.h = h < 0 ? h + 360 : h
  } else {
    hsl[property] = Math.max(0, Math.min(1, hsl[property] * value))
  }

  // 根据原始颜色格式返回结果
  if (typeof color === 'object') {
    return hslToRgb(hsl) as T
  }
  return (color.startsWith('#') ? hslToHex(hsl) : rgbToString(hslToRgb(hsl))) as T
}

/**
 * 调整颜色亮度
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} ratio - 亮度调整比率 (-1到1)
 * @returns {T} - 调整后的颜色
 */
export function adjustBrightness<T extends RgbColor | HexColor | RGBObject | string>(
  color: T,
  ratio: number
): T {
  return adjustColorProperty(color, ratio, 'l')
}

/**
 * 调整颜色饱和度
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} ratio - 饱和度调整比率 (-1到1)
 * @returns {T} - 调整后的颜色
 */
export function adjustSaturation<T extends RgbColor | HexColor | RGBObject | string>(
  color: T,
  ratio: number
): T {
  return adjustColorProperty(color, ratio, 's')
}

/**
 * 调整颜色色相
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} degrees - 色相调整角度 (-360 到 360)，负值表示顺时针旋转，正值表示逆时针旋转
 * @returns {T} - 调整后的颜色
 */
export function adjustHue<T extends RgbColor | HexColor | RGBObject | string>(
  color: T,
  degrees: number
): T {
  return adjustColorProperty(color, degrees, 'h')
}
