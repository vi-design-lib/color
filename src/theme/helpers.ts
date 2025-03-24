import { type BaseThemeOptions } from './base-theme.js'
import type { AnyColor } from '../types.js'
import { Theme, type ThemeOptions } from './theme.js'

export interface Options<T extends AnyColor, CustomKeys extends string>
  extends BaseThemeOptions<T, CustomKeys> {
  /**
   * 主色
   *
   * @default '#1677ff'
   */
  primary?: T
}

/**
 * 安装主题
 *
 * 支持 `Vitarx2` 、 `Vue3`
 *
 * @alias ThemePlugin
 * @param {Object} app - Vitarx、Vue应用实例
 * @param { Options } options - 选项
 * @param { AnyColor } [options.primary=#1677ff] - 主色
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.varPrefix=--color-] - css变量前缀
 * @param { string } [options.varSuffix] - css变量后缀
 * @param { function } [options.refProxy] - 自定义ref函数
 * @param { string } [options.cacheKey=theme] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {void}
 * @throws {Error} - 如果非浏览器端调用，则会抛出异常
 */
export function installTheme<T extends AnyColor, CustomKeys extends string>(
  app: any,
  options?: Options<T, CustomKeys>
): void {
  if (typeof app?.provide === 'function') {
    const { primary = '#1677ff', ...config } = options || {}
    if (!primary) throw new Error('primary color is required')
    const theme = new Theme(primary, config)
    // 注入到应用中
    app.provide('theme', theme)
    // 如果是 vitarx，则注入到APP容器中
    if (typeof app.register === 'function') {
      app.register('theme', theme)
    }
    // 如果是vue3，则注入到全局属性中
    if (typeof app.config?.globalProperties === 'object') {
      app.config.globalProperties.$theme = theme
    }
  }
}
export { installTheme as ThemePlugin }

/**
 * 创建主题实例
 *
 * > 注意：此函数创建的主题实例仅兼容浏览器端，非浏览器端会抛出异常！
 *
 * @param { AnyColor } primary - 主色
 * @param { ThemeOptions } [options] - 选项
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.varPrefix=--color-] - css变量前缀
 * @param { string } [options.varSuffix] - css变量后缀
 * @param { function } [options.refProxy] - 自定义ref函数
 * @param { string } [options.cacheKey=theme] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {Theme} - 主题实例
 * @throws {Error} - 如果非浏览器端调用，则会抛出异常
 */
export function createWebTheme<T extends AnyColor, CustomKeys extends string>(
  primary: T,
  options?: ThemeOptions<T, CustomKeys>
): Theme<T, CustomKeys> {
  return new Theme(primary, options)
}
