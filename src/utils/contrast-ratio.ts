import type { AnyColor, ColorTag, ColorToColorType, RGBObject } from '../types.js'
import { anyColorToHslObject, anyColorToRgbObject, anyColorToTargetColor } from './conversion.js'
import { capitalize, getColorType } from './tools.js'
import type { ColorSchemeRoles } from '../scheme/types/index.js'

/**
 * 将RGB颜色值转换为标准化颜色值
 * @param r 红色分量
 * @param g 绿色分量
 * @param b 蓝色分量
 * @returns {RGBObject} 返回包含标准化后的RGB颜色值的对象
 */
const rgbToNormalized = (r: number, g: number, b: number): RGBObject => {
  // 将颜色分量转换为标准化值的内部函数
  const normalize = (c: number) => {
    const normalized = c / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  return {
    r: normalize(r),
    g: normalize(g),
    b: normalize(b)
  }
}

/**
 * 计算RGB颜色的相对亮度
 *
 * @param r 红色分量
 * @param g 绿色分量
 * @param b 蓝色分量
 * @returns {number} 返回相对亮度值
 */
const relativeLuminance = (r: number, g: number, b: number): number => {
  const { r: rNorm, g: gNorm, b: bNorm } = rgbToNormalized(r, g, b)
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm
}

/**
 * 计算两种RGB颜色之间的对比度比率
 *
 * @param {AnyColor} color1 第一种颜色
 * @param {AnyColor} color2 第二种颜色
 * @returns {number} 返回对比度比率，结果四舍五入到小数点后两位
 */
export function contrastRatio(color1: AnyColor, color2: AnyColor): number {
  const rgb1 = anyColorToRgbObject(color1)
  const rgb2 = anyColorToRgbObject(color2)
  const luminance1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
}

/**
 * 计算颜色方案的对比度
 *
 * @param {Record<string, number>} scheme - 颜色方案
 * @param {string[]} [customColorKeys] - 自定义颜色的键，没有则不传入
 */
export function schemeContrastRation(
  scheme: ColorSchemeRoles<string, ColorTag>,
  customColorKeys: string[] = []
): Record<string, number> {
  const roles: string[] = ['main', 'aux', 'extra', 'warning', 'error'].concat(customColorKeys)
  const result: Record<string, number> = {}
  for (const role of roles) {
    const caseRole = capitalize(role)
    const roleColor = scheme[role]
    const onRoleColor = scheme[`on${caseRole}`]
    result[role] = contrastRatio(roleColor, onRoleColor)

    const roleHoverColor = scheme[`${role}Hover`]
    const onRoleHoverColor = scheme[`on${caseRole}Hover`]
    result[`${role}Hover`] = contrastRatio(roleHoverColor, onRoleHoverColor)

    const roleActiveColor = scheme[`${role}Active`]
    const onRoleActiveColor = scheme[`on${caseRole}Active`]
    result[`${role}Active`] = contrastRatio(roleActiveColor, onRoleActiveColor)

    const roleDisabledColor = scheme[`${role}Disabled`]
    const onRoleDisabledColor = scheme[`on${caseRole}Disabled`]
    result[`${role}Disabled`] = contrastRatio(roleDisabledColor, onRoleDisabledColor)

    const containerColor = scheme[`${role}Container`]
    const onContainerColor = scheme[`on${caseRole}Container`]
    result[`${role}Container`] = contrastRatio(containerColor, onContainerColor)
  }
  return result
}

/**
 * 自动调整前景色使其符合对比度要求
 *
 * @template T - 前景色类型
 * @param {T} foreground - 前景色
 * @param {ColorToColorType<T>} background - 背景色
 * @param {'AA' | 'AAA'} [level=AA] - WCAG标准级别
 *
 */
export function adjustForContrast<T extends AnyColor>(
  foreground: T,
  background: ColorToColorType<T>,
  level: 'AA' | 'AAA' = 'AA'
): ColorToColorType<T> {
  const minRatio = level === 'AA' ? 4.5 : 7

  const type = getColorType(foreground)
  const fgHSL = anyColorToHslObject(foreground)
  const bgHSL = anyColorToHslObject(background)
  const bgRgb = anyColorToRgbObject(background)
  let ratio = contrastRatio(fgHSL, bgRgb)

  // 如果已经满足要求，直接返回
  if (ratio >= minRatio) return foreground as any

  // 确定是增加还是减少亮度
  const shouldDarken = bgHSL.l > 0.5

  // 逐步调整亮度直到满足对比度要求
  const step = shouldDarken ? -0.05 : 0.05
  let attempts = 0
  const maxAttempts = 20 // 防止无限循环

  while (ratio < minRatio && attempts < maxAttempts) {
    fgHSL.l = Math.max(0, Math.min(1, fgHSL.l + step))
    ratio = contrastRatio(fgHSL, bgRgb)
    attempts++

    // 如果亮度已经到达极限但仍未满足要求，尝试调整饱和度
    if ((fgHSL.l <= 0.05 || fgHSL.l >= 0.95) && ratio < minRatio) {
      // 调整饱和度以增加对比度
      // 对于暗背景，增加饱和度；对于亮背景，减少饱和度
      const satStep = shouldDarken ? 0.1 : -0.1
      let satAttempts = 0
      const maxSatAttempts = 10

      while (ratio < minRatio && satAttempts < maxSatAttempts) {
        fgHSL.s = Math.max(0, Math.min(1, fgHSL.s + satStep))
        ratio = contrastRatio(fgHSL, bgRgb)
        satAttempts++
      }

      break // 饱和度调整后退出亮度调整循环
    }
  }

  return anyColorToTargetColor(fgHSL, type) as any
}
