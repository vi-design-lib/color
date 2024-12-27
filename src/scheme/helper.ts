import {
  anyColorToHslObject,
  anyColorToTargetColor,
  getColorType,
  HslFormula
} from '../utils/index.js'
import type { ColorScheme, HSLObject, ObjectColors, StringColors } from '../types.js'

/**
 * 创建主题配色方案
 *
 * @param {string} primary - 主色，支持RGB、HEX、HSL格式
 */
export function createBaseColorScheme<T extends StringColors | ObjectColors>(
  primary: T
): ColorScheme<T> {
  const outType = getColorType(primary)
  // 获取主色的 HSL 对象
  const primaryHsl = anyColorToHslObject(primary, outType)
  // 获取主色的 HSL 值
  const { h, s, l } = primaryHsl

  // 亮度调整，确保不会过亮或过暗
  const adjustedLightness = parseFloat(Math.min(Math.max(l * 1.1, 0), 1).toFixed(2)) // 保持亮度在 [0, 1] 范围内

  const sl = { s: HslFormula.ratioAdjust(s, 0.9), l: adjustedLightness }

  // 使用主色的反向互补颜色做为警告颜色
  const warningHsl = { h: HslFormula.complementaryHue(h), ...sl }

  // 固定红色范围的危险色
  const dangerHsl = { h: 0, ...sl } // 红色范围

  // 生成辅色和三级辅色的色相
  const minorHue = HslFormula.adjacentHue(h, -30) // 基于主色的相邻色 反向偏移
  const tertiaryHue = HslFormula.adjacentHue(h, 30) // 基于主色的相邻色，正向偏移

  // 确保辅色和三级辅色的饱和度低于主色
  const minorHsl = { h: minorHue, s: HslFormula.ratioAdjust(s, 0.8), l: adjustedLightness }
  const tertiaryHsl = { h: tertiaryHue, s: HslFormula.ratioAdjust(s, 0.7), l: adjustedLightness }

  // 生成中性色：灰色调带有主色调
  const neutralHsl = { h, s: 0.1, l: l * 0.9 } // 灰色带有主色调的HSL

  // 创建 HSL 配色方案
  const hslScheme: ColorScheme<HSLObject> = {
    primary: primaryHsl,
    minor: minorHsl,
    tertiary: tertiaryHsl,
    warning: warningHsl,
    danger: dangerHsl,
    neutral: neutralHsl
  }
  if (outType !== 'HSL') {
    // 将 HSL 配色方案转换为 RGB 或 HEX
    for (const hslSchemeKey in hslScheme) {
      const key = hslSchemeKey as keyof ColorScheme<T>
      const hsl = hslScheme[key]
      hslScheme[key] = anyColorToTargetColor(hsl, outType, 'HSL') as any
    }
  }
  return hslScheme as unknown as ColorScheme<T>
}
