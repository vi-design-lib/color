import type { AnyColor, ColorSchemeKeys, ColorSchemeRoles, RGBObject } from '../types.js'
import { anyColorToRgbObject } from './conversion.js'
import { capitalize } from './tools.js'

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
 */
export function schemeContrastRation<T extends ColorSchemeRoles<AnyColor>>(
  scheme: T
): Record<string, number> {
  const roles: Array<ColorSchemeKeys> = ['primary', 'aux', 'minor', 'warning', 'error']
  const result: Record<string, number> = {}
  for (const role of roles) {
    const caseRole = capitalize(role)
    const roleColor = scheme[role as keyof T] as AnyColor
    const onRoleColor = scheme[`on${caseRole}` as keyof T] as AnyColor
    result[role] = contrastRatio(roleColor, onRoleColor)

    const roleHoverColor = scheme[`${role}Hover` as keyof T] as AnyColor
    const onRoleHoverColor = scheme[`on${caseRole}Hover` as keyof T] as AnyColor
    result[`${role}Hover`] = contrastRatio(roleHoverColor, onRoleHoverColor)

    const roleActiveColor = scheme[`${role}Active` as keyof T] as AnyColor
    const onRoleActiveColor = scheme[`on${caseRole}Active` as keyof T] as AnyColor
    result[`${role}Active`] = contrastRatio(roleActiveColor, onRoleActiveColor)

    const roleDisabledColor = scheme[`${role}Disabled` as keyof T] as AnyColor
    const onRoleDisabledColor = scheme[`on${caseRole}Disabled` as keyof T] as AnyColor
    result[`${role}Disabled`] = contrastRatio(roleDisabledColor, onRoleDisabledColor)

    const containerColor = scheme[`${role}Container` as keyof T] as AnyColor
    const onContainerColor = scheme[`on${caseRole}Container` as keyof T] as AnyColor
    result[`${role}Container`] = contrastRatio(containerColor, onContainerColor)
  }
  return result
}
