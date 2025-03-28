import type { AnyColor, ColorScheme, ColorToColorType } from '../types.js'
import { type ComputeFormula, getColorType } from '../utils/index.js'
import Scheme from './scheme.js'

export interface ColorSchemeOptions<T extends AnyColor> {
  /**
   * 计算模式
   *
   * @default 'triadic'
   */
  formula?: ComputeFormula
  /**
   * 色相偏移角度
   */
  angle?: number
  /**
   * 自定义颜色方案
   *
   * 如果和基本配色方案重名，会覆盖基本配色方案
   */
  customColorScheme?: Record<string, T>
}
/**
 * 创建主题
 *
 * @template T - 颜色类型
 * @param {T} primary - 主色，支持16进制字符串颜色、rgb颜色、hsl颜色、颜色对象
 * @param options
 * @returns {Scheme} - 主题实例
 */
export function createScheme<T extends AnyColor>(
  primary: T,
  options?: ColorSchemeOptions<ColorToColorType<T>>
): Scheme<ColorToColorType<T>> {
  const primaryColorType = getColorType(primary)
  // 创建基本配色方案
  const colorsScheme = Scheme.createBaseColorScheme(primary, options?.formula, options?.angle)
  const customColorScheme = options?.customColorScheme
  // 合并自定义配色方案
  if (typeof customColorScheme === 'object' && !Array.isArray(customColorScheme)) {
    for (const colorsKey in customColorScheme) {
      const value = customColorScheme[colorsKey]
      let type
      try {
        type = getColorType(value)
      } catch (e) {
        throw new Error(`custom color scheme ${colorsKey} is not a valid color`)
      }
      if (type !== primaryColorType) {
        throw new Error(
          `custom color scheme ${colorsKey} color type must be the same as the primary color type`
        )
      }
      colorsScheme[colorsKey as keyof ColorScheme<T>] = value
    }
  }
  return new Scheme(colorsScheme)
}
