// @ts-ignore
import { ref } from 'vue'
import type { AnyColor, ColorTag } from '../types.js'
import { WebTheme, type WebThemeOptions } from './web-theme.js'
import type { ThemePluginOptions } from './vitarx-theme.js'

/**
 * Vue 框架主题插件
 *
 * 依赖ref，仅支持 `Vue3`版本
 *
 * @extends WebTheme
 */
export class VueTheme<
  OutColorTag extends ColorTag,
  CustomKeys extends string = never
> extends WebTheme<OutColorTag, CustomKeys> {
  /**
   * @inheritDoc
   */
  constructor(mainColor: AnyColor, options: WebThemeOptions<OutColorTag, CustomKeys> = {}) {
    options.refFactory ??= ref
    super(mainColor, options)
  }
}

/**
 * 主题插件
 *
 * 依赖ref，仅支持 `Vue3`版本
 *
 * @alias ThemePlugin
 * @param {Object} app - Vue应用实例
 * @param { ThemePluginOptions } options - 选项
 * @returns {void}
 * @throws {Error} - 如果非浏览器端调用，则会抛出异常
 */
export function theme<OutColorTag extends ColorTag, CustomKeys extends string>(
  app: any,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): void {
  if (typeof app?.provide === 'function') {
    const { mainColor = '#1677ff', ...config } = options || {}
    if (!mainColor) throw new Error('main color is required')
    const theme = new VueTheme(mainColor, config)
    // 注入到应用中
    app.provide('theme', theme)
    app.config.globalProperties.$theme = theme
  }
}
export { theme as ThemePlugin }

/**
 * 创建Vue主题实例
 *
 * @param { AnyColor } mainColor - 主色
 * @param { WebThemeOptions } [options] - 选项
 * @returns {VueTheme} - 主题实例
 */
export function createVueTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  mainColor: AnyColor,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): VueTheme<OutColorTag, CustomKeys> {
  return new VueTheme(mainColor, options)
}
