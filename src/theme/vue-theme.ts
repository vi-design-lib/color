// @ts-ignore
import { ref } from 'vue'
import type { AnyColor, ColorTag } from '../types.js'
import { WebTheme, type WebThemeOptions } from './web-theme.js'
import type { ThemePluginOptions } from './vitarx-theme.js'
import { DEFAULT_COLOR } from '../constant.js'

/**
 * Vue框架主题管理类
 *
 * @description 专为Vue3框架设计的主题管理类，使用Vue的ref实现响应式
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
 * @extends WebTheme<OutColorTag, CustomKeys>
 */
export class VueTheme<
  OutColorTag extends ColorTag,
  CustomKeys extends string = never
> extends WebTheme<OutColorTag, CustomKeys> {
  /**
   * VueTheme构造函数
   *
   * @description 创建一个Vue主题管理实例，使用Vue的ref函数实现响应式
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
 * Vue主题插件
 *
 * @description 为Vue3应用提供主题管理功能的插件，会自动注入主题实例
 * 依赖Vue的ref函数，仅支持Vue3框架
 *
 * @alias ThemePlugin
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 * @param {Object} app - Vue应用实例
 * @param {ThemePluginOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {AnyColor} [options.primaryColor=DEFAULT_COLOR] - 主色
 * @param {string} [options.varPrefix='--color-'] - CSS变量前缀
 * @param {string} [options.varSuffix] - CSS变量后缀
 * @param {string} [options.attribute=theme] - HTML属性名
 * @returns {void}
 * @throws {Error} 如果未提供primaryColor或非浏览器环境调用，则会抛出异常
 */
export function theme<OutColorTag extends ColorTag, CustomKeys extends string>(
  app: any,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): void {
  if (typeof app?.provide === 'function') {
    const { primaryColor = DEFAULT_COLOR, ...config } = options || {}
    if (!primaryColor) throw new Error('primaryColor is required')
    const theme = new VueTheme(primaryColor, config)
    // 注入到应用中
    app.provide('theme', theme)
    app.config.globalProperties.$theme = theme
  }
}

export { theme as ThemePlugin }

/**
 * 创建Vue主题实例
 *
 * @description 创建一个Vue3框架环境下的主题管理实例
 *
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 * @param {AnyColor} primaryColor - 主色，作为整个配色方案的基础
 * @param {ThemePluginOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {string} [options.varPrefix=--color-] - CSS变量前缀
 * @param {string} [options.varSuffix] - CSS变量后缀
 * @param {string} [options.attribute=theme] - HTML属性名
 * @param {string} [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param {RefFactory} [options.refFactory] - 自定义ref函数，默认使用Vue的ref
 * @param {ComputeFormula} [options.formula=triadic] - 配色方案算法
 * @param {number} [options.angle] - 色相偏移角度
 * @returns {VueTheme<OutColorTag, CustomKeys>} 主题实例
 */
export function createVueTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  primaryColor: AnyColor,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): VueTheme<OutColorTag, CustomKeys> {
  return new VueTheme(primaryColor, options)
}
