import type { HexColor, RGBColor, RgbColor } from '../types.js'
import { colorToRgbObj, hslToHex, hslToRgb, rgbToHsl, rgbToString } from './conversion.js'

/**
 * 调整颜色亮度
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} percent - 亮度调整百分比 (负值表示减少亮度，正值表示增加亮度，范围 0-1)
 * @returns {T} - 调整后的颜色
 */
export function adjustBrightness<T extends RgbColor | HexColor | RGBColor | string>(
  color: T,
  percent: number
): T {
  if (percent < -1 || percent > 1) {
    throw new Error('Percent must be between -1 and 1')
  }

  // 将颜色转换为 HSL
  let hsl = typeof color === 'string' ? rgbToHsl(colorToRgbObj(color)) : rgbToHsl(color)

  // 根据 percent 的正负值来调整亮度
  if (percent > 0) {
    // 增加亮度
    hsl.l = Math.min(1, hsl.l + percent)
  } else {
    // 减少亮度
    hsl.l = Math.max(0, hsl.l + percent)
  }

  // 根据原始颜色格式返回结果
  if (typeof color === 'object') {
    return hslToRgb(hsl) as T
  }

  try {
    return (color.startsWith('#') ? hslToHex(hsl) : rgbToString(hslToRgb(hsl))) as T
  } catch (error) {
    throw new Error(`Failed to convert color: ${error}`)
  }
}

/**
 * 调整颜色饱和度
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} percent - 饱和度调整百分比 (0-1)，负值表示减少饱和度，正值表示增加饱和度
 * @returns {T} - 调整后的颜色
 */
export function adjustSaturation<T extends RgbColor | HexColor | RGBColor | string>(
  color: T,
  percent: number
): T {
  if (percent < -1 || percent > 1) {
    throw new Error('Percent must be between -1 and 1')
  }

  // 将颜色转换为 HSL
  let hsl = typeof color === 'string' ? rgbToHsl(colorToRgbObj(color)) : rgbToHsl(color)

  // 调整饱和度
  hsl.s = Math.min(1, Math.max(0, hsl.s + percent))

  // 根据原始颜色格式返回结果
  if (typeof color === 'object') {
    return hslToRgb(hsl) as T
  }

  try {
    return (color.startsWith('#') ? hslToHex(hsl) : rgbToString(hslToRgb(hsl))) as T
  } catch (error) {
    throw new Error(`Failed to convert color: ${error}`)
  }
}

/**
 * 调整颜色色相
 *
 * @template T - 颜色类型，可以是RGB颜色对象、HEX颜色字符串或RGB颜色字符串
 * @param {T} color - 颜色
 * @param {number} degrees - 色相调整角度 (-360 到 360)，负值表示顺时针旋转，正值表示逆时针旋转
 * @returns {T} - 调整后的颜色
 */
export function adjustHue<T extends RgbColor | HexColor | RGBColor | string>(
  color: T,
  degrees: number
): T {
  if (degrees < -360 || degrees > 360) {
    throw new Error('Degrees must be between -360 and 360')
  }

  // 将颜色转换为 HSL
  let hsl = typeof color === 'string' ? rgbToHsl(colorToRgbObj(color)) : rgbToHsl(color)

  // 调整色相，确保色相值在 0-360 范围内
  hsl.h = (hsl.h + degrees) % 360
  if (hsl.h < 0) hsl.h += 360

  // 根据原始颜色格式返回结果
  if (typeof color === 'object') {
    return hslToRgb(hsl) as T
  }

  try {
    return (color.startsWith('#') ? hslToHex(hsl) : rgbToString(hslToRgb(hsl))) as T
  } catch (error) {
    throw new Error(`Failed to convert color: ${error}`)
  }
}
