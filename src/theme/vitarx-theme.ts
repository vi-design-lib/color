// @ts-ignore
import { ref } from 'vitarx'
import { WebTheme, type WebThemeOptions } from './web-theme.js'
import type { AnyColor, ColorTag } from '../types.js'
import { DEFAULT_COLOR } from '../constant.js'

/**
 * Vitarx主题插件配置选项接口
 *
 * @description 扩展Web主题配置，添加Vitarx框架特有的选项
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 */
export interface ThemePluginOptions<OutColorTag extends ColorTag, CustomKeys extends string>
  extends WebThemeOptions<OutColorTag, CustomKeys> {
  /**
   * 主色
   *
   * @description 作为整个配色方案的基础颜色
   * @default DEFAULT_COLOR
   */
  primaryColor?: AnyColor
}

/**
 * Vitarx框架主题管理类
 *
 * @description 专为Vitarx框架设计的主题管理类，使用Vitarx的ref实现响应式
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
 * @extends WebTheme<OutColorTag, CustomKeys>
 */
export class VitarxTheme<
  OutColorTag extends ColorTag,
  CustomKeys extends string = never
> extends WebTheme<OutColorTag, CustomKeys> {
  /**
   * VitarxTheme构造函数
   *
   * @description 创建一个Vitarx主题管理实例，使用Vitarx的ref函数实现响应式
   * @constructor
   * @inheritDoc
   * @param {AnyColor} primaryColor - 主色，作为整个配色方案的基础
   * @param {WebThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项，用于自定义主题行为
   */
  constructor(primaryColor: AnyColor, options: WebThemeOptions<OutColorTag, CustomKeys> = {}) {
    options.refFactory ??= ref
    super(primaryColor, options)
  }
}

/**
 * Vitarx主题插件
 *
 * @description 为Vitarx应用提供主题管理能力的插件，会自动注入主题实例
 *
 * @alias ThemePlugin
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 * @param {Object} app - Vitarx应用实例
 * @param {ThemePluginOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {AnyColor} [options.primaryColor=DEFAULT_COLOR] - 主色
 * @param {string} [options.varPrefix='--color-'] - CSS变量前缀
 * @param {string} [options.varSuffix] - CSS变量后缀
 * @param {string} [options.attribute=theme] - HTML属性名
 * @returns {void}
 */
export function theme<OutColorTag extends ColorTag, CustomKeys extends string>(
  app: any,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): void {
  if (typeof app?.provide === 'function') {
    const { primaryColor = DEFAULT_COLOR, ...config } = options || {}
    const theme = new VitarxTheme(primaryColor, config)
    // 注入到应用中
    app.provide('theme', theme)
  }
}

export { theme as ThemePlugin }

/**
 * 创建Vitarx主题实例
 *
 * @description 创建一个Vitarx框架环境下的主题管理实例
 *
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 * @param {AnyColor} primaryColor - 主色，作为整个配色方案的基础
 * @param {ThemePluginOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {string} [options.varPrefix=--color-] - CSS变量前缀
 * @param {string} [options.varSuffix] - CSS变量后缀
 * @param {string} [options.attribute=theme] - HTML属性名
 * @param {string} [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param {RefFactory} [options.refFactory] - 自定义ref函数，默认使用Vitarx的ref
 * @param {ComputeFormula} [options.formula=triadic] - 配色方案算法
 * @param {number} [options.angle] - 色相偏移角度
 * @returns {VitarxTheme<OutColorTag, CustomKeys>} 主题实例
 */
export function createVitarxTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  primaryColor: AnyColor,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): VitarxTheme<OutColorTag, CustomKeys> {
  return new VitarxTheme(primaryColor, options)
}
