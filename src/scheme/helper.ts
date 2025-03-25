import type { AnyColor, ColorScheme, ColorToColorType } from '../types.js'
import { type ComputeFormula, getColorType } from '../utils/index.js'
import { Scheme, type SchemeOptions } from './scheme.js'

export interface ColorSchemeOptions<T extends AnyColor> extends SchemeOptions {
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
 * @param {T} main - 主色，支持16进制字符串颜色、rgb颜色、hsl颜色、颜色对象
 * @param {ColorSchemeOptions<ColorToColorType<T>>} [options] - 可选的配置项
 * @param {ComputeFormula} [options.formula] - 主题计算公式
 * @param {number} [options.angle] - 色相偏移角度
 * @param {Record<string, ColorToColorType<T>>} [options.customColorScheme] - 自定义颜色方案
 * @returns {Scheme} - 主题实例
 */
export function createScheme<T extends AnyColor>(
  main: T,
  options?: ColorSchemeOptions<ColorToColorType<T>>
): Scheme<ColorToColorType<T>> {
  const primaryColorType = getColorType(main)
  const { formula, angle, customColorScheme, ...schemeOptions } = options || {}
  // 创建基本配色方案
  const colorsScheme = Scheme.createBaseColorScheme(main, formula, angle)
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
  return new Scheme(colorsScheme, schemeOptions)
}
