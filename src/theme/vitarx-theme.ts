// @ts-ignore
import { ref } from 'vitarx'
import { WebTheme, type WebThemeOptions } from './web-theme.js'
import type { AnyColor, ColorTag } from '../types.js'

export interface ThemePluginOptions<OutColorTag extends ColorTag, CustomKeys extends string>
  extends WebThemeOptions<OutColorTag, CustomKeys> {
  /**
   * 主色
   *
   * @default '#1677ff'
   */
  mainColor?: AnyColor
}

/**
 * Vitarx 框架主题插件
 *
 * @extends WebTheme
 */
export class VitarxTheme<
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
 * 依赖ref，仅支持 `Vitarx`
 *
 * @alias ThemePlugin
 * @param {Object} app - Vue应用实例
 * @param { ThemePluginOptions } [options] - 选项
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
    const theme = new VitarxTheme(mainColor, config)
    // 注入到应用中
    app.provide('theme', theme)
    app.register('theme', theme)
  }
}
export { theme as ThemePlugin }

/**
 * 创建Vitarx主题实例
 *
 * @param { AnyColor } mainColor - 主色
 * @param { WebThemeOptions } [options] - 选项
 * @returns {VitarxTheme} - 主题实例
 */
export function createVitarxTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  mainColor: AnyColor,
  options?: ThemePluginOptions<OutColorTag, CustomKeys>
): VitarxTheme<OutColorTag, CustomKeys> {
  return new VitarxTheme(mainColor, options)
}
