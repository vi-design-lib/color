// @ts-ignore
import { ref } from 'vue'
import type { AnyColor, HexColor, ThemePluginOptions } from '../types.js'
import { WebTheme, type WebThemeOptions } from './web-theme.js'

export type VitarxThemeOptions<T extends AnyColor, CustomKeys extends string> = Omit<
  WebThemeOptions<T, CustomKeys>,
  'refFactory'
>

export type VueThemePluginOptions<
  T extends AnyColor,
  CustomKeys extends string
> = ThemePluginOptions<T, CustomKeys>

/**
 * Vue 框架主题插件
 *
 * 依赖ref，仅支持 `Vue3`版本
 *
 * @extends WebTheme
 */
export class VueTheme<
  T extends AnyColor = HexColor,
  CustomKeys extends string = never
> extends WebTheme<T, CustomKeys> {
  /**
   * @inheritDoc
   */
  constructor(mainColor: T, options: VitarxThemeOptions<T, CustomKeys> = {}) {
    // @ts-ignore
    options.refProxy = ref
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
 * @param { VueThemePluginOptions } options - 选项
 * @param { AnyColor } [options.main=#1677ff] - 主色
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.varPrefix=--color-] - css变量前缀
 * @param { string } [options.varSuffix] - css变量后缀
 * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {void}
 * @throws {Error} - 如果非浏览器端调用，则会抛出异常
 */
export function theme<T extends AnyColor, CustomKeys extends string>(
  app: any,
  options?: VueThemePluginOptions<T, CustomKeys>
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
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.varPrefix=--color-] - css变量前缀
 * @param { string } [options.varSuffix] - css变量后缀
 * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {VueTheme} - 主题实例
 */
export function createVueTheme<T extends AnyColor, CustomKeys extends string>(
  mainColor: T,
  options?: VueThemePluginOptions<T, CustomKeys>
): VueTheme<T, CustomKeys> {
  return new VueTheme(mainColor, options)
}
