import type {
  AnyColor,
  ColorSchemeRoles,
  ColorToColorType,
  ExpandColorSchemeRoles,
  HexColor,
  TonalKeys,
  Tone
} from '../types.js'
import { Scheme } from '../scheme/index.js'
import { anyColorToHexColor, camelToKebab } from '../utils/index.js'
import { BaseTheme, type BaseThemeOptions, type Brightness, type ThemeMode } from './base-theme.js'

export interface WebThemeOptions<T extends AnyColor, CustomKeys extends string>
  extends BaseThemeOptions<T, CustomKeys> {
  /**
   * css变量前缀
   *
   * 默认是 `--color-`，生成的变量名会自动转换为`kebab-case`格式。
   *
   * 例如：`--color-primary: #ffffff;`
   *
   * > 注意：如果不需要前缀也必须传入`--`，因为css变量定义必须以`--`开头
   *
   * @default '--color-'
   */
  varPrefix?: string
  /**
   * css变量后缀
   *
   * 通常以 `-` 开头，例如：`-color`
   *
   * @default ''
   */
  varSuffix?: string
  /**
   * HTML根元素用于记录主题亮度的属性名
   *
   * @default 'theme'
   */
  attribute?: string
}

/**
 * 浏览器环境，主题管理类
 *
 * 依赖浏览器端`CSSStyleSheet`和`matchMedia`特性，自动生成css变量样式表，支持动态切换主题。
 *
 * @template T - 主题色类型
 * @template CustomKeys - 自定义配色名称
 */
export class WebTheme<
  T extends AnyColor = HexColor,
  CustomKeys extends string = never
> extends BaseTheme<T, CustomKeys> {
  // 样式表
  private readonly _sheet: CSSStyleSheet | undefined
  /**
   * css变量后缀
   *
   * @default ''
   */
  public readonly varSuffix: string
  /**
   * css变量前缀
   *
   * @default '--color-'
   */
  public readonly varPrefix: string
  /**
   * HTML根元素用于记录主题亮度的属性名
   *
   * @private
   */
  public readonly attribute: string
  /**
   * 是否为浏览器环境
   *
   * @private
   */
  protected _isBrowser = typeof window === 'object' && typeof document === 'object'
  /**
   * Theme构造函数
   *
   * @constructor
   * @param { AnyColor } primary - 主色
   * @param { WebThemeOptions } options - 选项
   * @param { Object } options.customColorScheme - 自定义基准配色
   * @param { string } [options.varPrefix=--color-] - css变量前缀，仅浏览器端有效
   * @param { string } [options.varSuffix] - css变量后缀，仅浏览器端有效
   * @param { function } [options.refProxy] - 自定义ref函数
   * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
   * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
   * @param { number } [options.angle] - 色相偏移角度
   */
  constructor(primary: T, options?: WebThemeOptions<T, CustomKeys>) {
    super(primary, options)
    if (!this._isBrowser) throw new Error('当前环境非浏览器环境，请使用浏览器环境运行！')
    this.attribute = options?.attribute || 'theme'
    this.varPrefix = options?.varPrefix || '--color-'
    this.varSuffix = options?.varSuffix || ''
    document.documentElement.setAttribute(options?.attribute || 'theme', this.bright)
    this._sheet = WebTheme.createStyleSheet()
    this.updateStyles()
    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      // 如果是system模式，则切换主题
      if (this.mode === 'system') this.setMode(e.matches ? 'dark' : 'light')
    })
  }

  /**
   * 创建一个样式表
   *
   * @returns {CSSStyleSheet} - CSSStyleSheet。
   */
  public static createStyleSheet(): CSSStyleSheet {
    let cssSheet: CSSStyleSheet
    if ('CSSStyleSheet' in window && 'adoptedStyleSheets' in document) {
      cssSheet = new CSSStyleSheet()
      document.adoptedStyleSheets.push(cssSheet)
    } else {
      const style = document.createElement('style')
      style.appendChild(
        document.createComment('此样式表由@vi-design/color注入与管理，请勿外部变更。')
      )
      document.head.append(style)
      cssSheet = style.sheet!
    }
    return cssSheet
  }

  /**
   * @inheritDoc
   */
  protected override setCacheThemeMode(mode: ThemeMode) {
    localStorage.setItem(this.cacheKey, mode)
  }

  /**
   * @inheritDoc
   */
  public override changeColorScheme(
    primary: ColorToColorType<T>,
    customColorScheme?: Record<CustomKeys, ColorToColorType<T>>
  ) {
    super.changeColorScheme(primary, customColorScheme)
    this.updateStyles()
  }

  /**
   * 获取css变量
   *
   * 如果仅需要获取变量名，请使用`varName`方法
   *
   * @example
   * theme.cssVar('primary')
   * theme.cssVar('primary-10')
   * theme.cssVar('customColor')
   * theme.cssVar('customColor-10')
   *
   * @param {string} key - 配色角色key、调色板key
   * @return {string} css变量，已包含var(...)
   */
  cssVar(
    key:
      | keyof ColorSchemeRoles<T>
      | keyof ExpandColorSchemeRoles<T, CustomKeys>
      | TonalKeys
      | `${CustomKeys}-${Tone}`
  ): `var(${string})` {
    return `var(${this.varName(key)})`
  }

  /**
   * 将配色方案key转换为css变量名
   *
   * @param {string} key - 配色方案key
   * @returns {string} css变量名
   */
  varName(key: string): `--${string}` {
    return `${this.varPrefix}${camelToKebab(key)}${this.varSuffix}` as `--${string}`
  }

  /**
   * 更新样式表
   *
   * 非浏览器环境，不会更新样式表！
   */
  protected updateStyles() {
    if (!this._isBrowser || !this._sheet) return
    while (this._sheet.cssRules.length > 0) {
      this._sheet.deleteRule(0)
    }
    const generateRoleStyles = (scheme: Scheme<AnyColor>, theme: 'dark' | 'light') => {
      return Object.keys(scheme[theme].roles)
        .map((rule) => {
          const color = scheme[theme].roles[rule as 'primary']
          return `${this.varName(rule)}: ${color};`
        })
        .join('\n')
    }

    const generateTonalStyles = (scheme: Scheme<AnyColor>, theme: 'dark' | 'light') => {
      return Object.entries(scheme[theme].tonal)
        .map(([key, value]) => {
          return `${this.varName(key)}: ${anyColorToHexColor(value)};`
        })
        .join('\n')
    }

    const lightStyles =
      generateRoleStyles(this.scheme, 'light') + generateTonalStyles(this.scheme, 'light')
    const darkStyles =
      generateRoleStyles(this.scheme, 'dark') + generateTonalStyles(this.scheme, 'dark')
    this._sheet.insertRule(`html[${this.attribute}="light"]{${lightStyles}}`, 0)
    this._sheet.insertRule(`html[${this.attribute}="dark"]{${darkStyles}}`, 1)
  }

  /**
   * @inheritDoc
   */
  override get systemBright(): Brightness {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * @inheritDoc
   */
  public override setMode(mode: ThemeMode): boolean {
    const result = super.setMode(mode)
    if (result) {
      document.documentElement.setAttribute(this.attribute, this.bright)
      this.updateStyles()
    }
    return result
  }

  /**
   * @inheritDoc
   */
  public override getCacheThemeMode(): ThemeMode | null {
    return localStorage.getItem(this.cacheKey) as ThemeMode
  }

  /**
   * @inheritDoc
   */
  public override clearCache() {
    localStorage.removeItem(this.cacheKey)
  }
}

/**
 * 创建WEB主题实例
 *
 * 如果你使用的是 `Vitarx` 或 `Vue3` 框架，则指定 `options.refProxy` 为框架提供的 `ref` 函数，
 * 这样可以让 role 和 tonal 获取的颜色具有响应性
 *
 * > 注意：此函数创建的主题实例仅兼容浏览器端，非浏览器端会抛出异常！
 *
 * @param { AnyColor } primary - 主色
 * @param { WebThemeOptions } [options] - 选项
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.varPrefix=--color-] - css变量前缀
 * @param { string } [options.varSuffix] - css变量后缀
 * @param { function } [options.refProxy] - 自定义ref函数
 * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {WebTheme} - 主题实例
 */
export function createWebTheme<T extends AnyColor, CustomKeys extends string>(
  primary: T,
  options?: WebThemeOptions<T, CustomKeys>
): WebTheme<T, CustomKeys> {
  return new WebTheme(primary, options)
}
