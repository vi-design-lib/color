import type { AnyColor, ColorTag } from '../types.js'
import { Scheme } from './scheme.js'
import type { SchemeOptions } from './types/index.js'

/**
 * 创建主题
 *
 * @template OutColorTag - 输出颜色类型标签
 * @template CustomKeys - 自定义颜色键
 * @param {AnyColor} mainColor - 主色
 * @param {SchemeOptions<OutColorTag, CustomKeys>} [options] - 可选的配置项
 * @param {SchemeOptions} [options] - 配置选项
 * @param {Object} [options.darkRoleRule=Scheme.darkRoleRule] - 暗色模式调色板取色规则
 * @param {Object} [options.lightRoleRule=Scheme.lightRoleRule] - 亮色模式调色板取色规则
 * @param {Object} [options.customColorScheme] - 自定义颜色方案
 * @param {string} [options.outType] - 调试板要使用的目标类型
 * @returns {Scheme} - 主题实例
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
