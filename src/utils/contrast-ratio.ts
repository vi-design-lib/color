import type { AnyColor, ColorTag, ColorToColorType, RGBObject } from '../types.js'
import { anyColorToHslObject, anyColorToRgbObject, anyColorToTargetColor } from './conversion.js'
import { capitalize, getColorType } from './tools.js'
import type { ColorSchemeRoles } from '../scheme/index.js'

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
  const roles: string[] = ['primary', 'secondary', 'tertiary', 'warning', 'error'].concat(
    customColorKeys
  )
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
 * 智能调整前景色和背景色使其符合对比度要求
 *
 * 该函数会同时调整前景色和背景色，确保达到WCAG对比度标准的同时保持颜色的柔和协调。
 * 优先调整亮度，必要时调整饱和度，确保视觉效果的美观性。
 *
 * @template T - 前景色类型
 * @param {T} foreground - 前景色
 * @param {ColorToColorType<T>} background - 背景色
 * @param {'AA' | 'AAA'} [level=AA] - WCAG标准级别
 * @returns {{ foreground: ColorToColorType<T>, background: ColorToColorType<T> }} 调整后的前景色和背景色
 */
export function adjustForContrast<T extends AnyColor>(
  foreground: T,
  background: ColorToColorType<T>,
  level: 'AA' | 'AAA' = 'AA'
): { foreground: ColorToColorType<T>; background: ColorToColorType<T> } {
  const minRatio = level === 'AA' ? 4.5 : 7
  const type = getColorType(foreground)

  // 转换为HSL对象进行调整
  const fgHSL = anyColorToHslObject(foreground)
  const bgHSL = anyColorToHslObject(background)

  // 备份原始值用于回退
  const originalFgHSL = { ...fgHSL }
  const originalBgHSL = { ...bgHSL }

  let ratio = contrastRatio(fgHSL, anyColorToRgbObject({ h: bgHSL.h, s: bgHSL.s, l: bgHSL.l }))

  // 如果已经满足要求，直接返回原始颜色
  if (ratio >= minRatio) {
    return {
      foreground: foreground as any,
      background: background as any
    }
  }

  // 智能调整策略：同时调整前景色和背景色
  const adjustColors = () => {
    const maxAttempts = 30
    let attempts = 0

    while (ratio < minRatio && attempts < maxAttempts) {
      attempts++

      // 计算当前亮度差异
      const lightnessDiff = Math.abs(fgHSL.l - bgHSL.l)

      // 如果亮度差异太小，需要拉开距离
      if (lightnessDiff < 0.3) {
        // 判断哪个更亮，向相反方向调整
        if (fgHSL.l > bgHSL.l) {
          // 前景色更亮，增加前景色亮度，减少背景色亮度
          fgHSL.l = Math.min(0.95, fgHSL.l + 0.08)
          bgHSL.l = Math.max(0.05, bgHSL.l - 0.08)
        } else {
          // 背景色更亮，增加背景色亮度，减少前景色亮度
          bgHSL.l = Math.min(0.95, bgHSL.l + 0.08)
          fgHSL.l = Math.max(0.05, fgHSL.l - 0.08)
        }
      } else {
        // 亮度差异足够，进行微调
        const fgStep = fgHSL.l > 0.5 ? -0.03 : 0.03
        const bgStep = bgHSL.l > 0.5 ? -0.03 : 0.03

        fgHSL.l = Math.max(0.05, Math.min(0.95, fgHSL.l + fgStep))
        bgHSL.l = Math.max(0.05, Math.min(0.95, bgHSL.l + bgStep))
      }

      // 重新计算对比度
      const bgRgb = anyColorToRgbObject({ h: bgHSL.h, s: bgHSL.s, l: bgHSL.l })
      ratio = contrastRatio(fgHSL, bgRgb)

      // 如果亮度调整到极限仍不满足，尝试调整饱和度
      if (attempts > 20 && ratio < minRatio) {
        adjustSaturation()
        break
      }
    }
  }

  // 饱和度调整辅助函数
  const adjustSaturation = () => {
    const satAttempts = 10

    for (let i = 0; i < satAttempts && ratio < minRatio; i++) {
      // 通过调整饱和度来增强对比度
      if (fgHSL.l < bgHSL.l) {
        // 前景色较暗，降低饱和度使其更接近纯色
        fgHSL.s = Math.max(0.1, fgHSL.s - 0.1)
        // 背景色较亮，适度提高饱和度保持活力
        bgHSL.s = Math.min(0.8, bgHSL.s + 0.05)
      } else {
        // 前景色较亮，适度提高饱和度
        fgHSL.s = Math.min(0.8, fgHSL.s + 0.05)
        // 背景色较暗，降低饱和度
        bgHSL.s = Math.max(0.1, bgHSL.s - 0.1)
      }

      const bgRgb = anyColorToRgbObject({ h: bgHSL.h, s: bgHSL.s, l: bgHSL.l })
      ratio = contrastRatio(fgHSL, bgRgb)
    }
  }

  // 执行智能调整
  adjustColors()

  // 如果仍然无法满足要求，使用保守的黑白方案
  if (ratio < minRatio) {
    // 静默处理，不显示警告信息，避免在正常使用中产生干扰

    // 根据背景亮度选择高对比度的前景色
    if (bgHSL.l > 0.5) {
      // 亮背景使用深色前景
      fgHSL.l = 0.1
      fgHSL.s = 0.2
    } else {
      // 暗背景使用浅色前景
      fgHSL.l = 0.9
      fgHSL.s = 0.2
      // 同时适度调亮背景
      bgHSL.l = Math.max(bgHSL.l, 0.15)
    }
  }

  // 颜色柔和化处理，确保视觉舒适
  const softenColors = () => {
    // 避免过于鲜艳的饱和度
    fgHSL.s = Math.min(fgHSL.s, 0.85)
    bgHSL.s = Math.min(bgHSL.s, 0.75)

    // 确保亮度在舒适范围内
    fgHSL.l = Math.max(0.08, Math.min(0.92, fgHSL.l))
    bgHSL.l = Math.max(0.08, Math.min(0.92, bgHSL.l))
  }

  softenColors()

  // 转换回目标颜色格式
  const adjustedForeground = anyColorToTargetColor(fgHSL, type) as ColorToColorType<T>
  const adjustedBackground = anyColorToTargetColor(bgHSL, type) as ColorToColorType<T>

  return {
    foreground: adjustedForeground,
    background: adjustedBackground
  }
}
