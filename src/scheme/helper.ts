import { colorToHexObj, HslFormula, hslObjectToColor, hslToHex, hslToRgb } from '../utils/index.js'
import type { BaseColorScheme, HSLObject, Out, OutType, StrColors } from '../types.js'

/**
 * 创建主题配色方案
 *
 * @param {string} primary - 主色，支持RGB、HEX、HSL格式
 *
 * @param {OutType} outType - 输出颜色类型，可以是`hex`|`rgb`|`RGB`|`HSL`
 */
export function createBaseColorSchemeFromColor<OUT extends OutType = 'HSL'>(
  primary: StrColors,
  outType: OUT = 'HSL' as OUT
): BaseColorScheme<Out<OUT>> {
  // 获取主色的 HSL 对象
  const primaryHsl = colorToHexObj(primary)
  // 获取主色的 HSL 值
  const { h, s, l } = primaryHsl

  // 降低饱和度，确保状态色不超过主色饱和度
  const adjustedSaturation = HslFormula.ratioAdjust(s, 0.9)

  // 亮度调整，确保不会过亮或过暗
  const adjustedLightness = Math.min(Math.max(l * 1.1, 0), 1) // 保持亮度在 [0, 1] 范围内
  const sl = { s: adjustedSaturation, l: adjustedLightness }

  // 使用主色的反向互补颜色做为警告颜色
  const warningHsl = { h: HslFormula.complementaryHue(h), ...sl }

  // 固定红色范围的危险色
  const dangerHsl = { h: 0, ...sl } // 红色范围

  // 生成辅色和三级辅色的色相
  const secondaryHue = HslFormula.adjacentHue(h, -30) // 基于主色的相邻色 反向偏移
  const tertiaryHue = HslFormula.adjacentHue(h, 30) // 基于主色的相邻色，正向偏移

  // 确保辅色和三级辅色的饱和度低于主色
  const secondaryHsl = { h: secondaryHue, ...sl }
  const tertiaryHsl = { h: tertiaryHue, ...sl }

  // 生成中性色：灰色调带有主色调
  const neutralHsl = { h, s: 0.1, l: l * 0.9 } // 灰色带有主色调的HSL
  // 创建 HSL 配色方案
  const hslScheme: BaseColorScheme<HSLObject> = {
    primary: primaryHsl,
    secondary: secondaryHsl,
    tertiary: tertiaryHsl,
    warning: warningHsl,
    danger: dangerHsl,
    neutral: neutralHsl
  }
  if (outType !== 'HSL') {
    // 将 HSL 配色方案转换为 RGB 或 HEX
    for (const hslSchemeKey in hslScheme) {
      const hsl = hslScheme[hslSchemeKey as keyof BaseColorScheme<HSLObject>]
      const newScheme: Record<string, any> = hslScheme
      switch (outType) {
        case 'hex':
          newScheme[hslSchemeKey] = hslToHex(hsl)
          break
        case 'rgb':
          newScheme[hslSchemeKey] = hslToRgb(hsl)
          break
        case 'hsl':
          newScheme[hslSchemeKey] = hslObjectToColor(hsl)
          break
        default:
          newScheme[hslSchemeKey] = hslToRgb(hsl)
      }
    }
  }
  return hslScheme as BaseColorScheme<Out<OUT>>
}
