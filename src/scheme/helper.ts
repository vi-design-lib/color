import type { AnyColor, ColorTag } from '../types.js'
import { Scheme } from './scheme.js'
import type { SchemeOptions } from './types/index.js'

/**
 * 创建配色方案
 *
 * 根据提供的主色创建一个完整的配色方案实例，支持自定义颜色和亮暗色模式。
 * 该函数是Scheme类的工厂函数，提供了一种便捷的方式来创建配色方案。
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为'hex'
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
 * @param {AnyColor} mainColor - 主色，作为整个配色方案的基础
 * @param {SchemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {DeepPartial<PaletteExtractionColorRules>} [options.darkRoleRule=Scheme.darkRoleRule] - 暗色模式调色板取色规则
 * @param {DeepPartial<PaletteExtractionColorRules>} [options.lightRoleRule=Scheme.lightRoleRule] - 亮色模式调色板取色规则
 * @param {Record<CustomKeys, AnyColor>} [options.customColor] - 自定义颜色配置
 * @param {OutColorTag} [options.outType='hex'] - 调色板输出的颜色类型
 * @param {ComputeFormula} [options.formula='triadic'] - 计算辅助色的公式
 * @param {number} [options.angle] - 色相偏移角度
 * @returns {Scheme<OutColorTag, CustomKeys>} - 配色方案实例，包含完整的亮色/暗色模式配色
 */
export function createScheme<
  OutColorTag extends ColorTag = 'hex',
  CustomKeys extends string = never
>(
  mainColor: AnyColor,
  options?: SchemeOptions<OutColorTag, CustomKeys>
): Scheme<OutColorTag, CustomKeys> {
  return new Scheme(mainColor, options)
}
