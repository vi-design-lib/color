import type {
  AnyColor,
  ColorSchemeRoles,
  ColorToColorType,
  ExpandColorSchemeRoles,
  TonalKeys,
  Tone
} from '../types.js'
import { Scheme } from '../scheme/index.js'
import { anyColorToHexColor, camelToKebab } from '../utils/index.js'
import { BaseTheme, type BaseThemeOptions, type Bright, type ThemeMode } from './base-theme.js'

export interface ThemeOptions<T extends AnyColor, CustomKeys extends string>
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
export class Theme<T extends AnyColor, CustomKeys extends string> extends BaseTheme<T, CustomKeys> {
  // 样式表
  private readonly _sheet: CSSStyleSheet
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
   * Theme构造函数
   *
   * @constructor
   * @param primary - 主色
   * @param options - 选项
   * @param options.customColorScheme - 自定义基准配色
   * @param options.varPrefix - css变量前缀
   * @param options.varSuffix - css变量后缀
   * @param options.refProxy - 自定义ref函数
   * @param options.cacheKey - 自定义缓存名称
   */
  constructor(primary: T, options?: ThemeOptions<T, CustomKeys>) {
    if (typeof window !== 'object' || typeof document !== 'object') {
      throw new Error('非浏览器环境不支持主题管理！')
    }
    super(primary, options)
    this.attribute = options?.attribute || 'theme'
    document.documentElement.setAttribute(options?.attribute || 'theme', this.bright)
    this.varPrefix = options?.varPrefix || '--color-'
    this.varSuffix = options?.varSuffix || ''
    this._sheet = Theme.createStyleSheet()
    this.updateStyles()
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
  protected override cacheThemeMode(mode: ThemeMode) {
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
   * theme.cssVar('custom-color')
   * theme.cssVar('custom-color-10')
   *
   * @param {string} key - 配色方案key、调色板key、自定义配色key
   * @return {string} css变量，已包含var(...)
   */
  cssVar(
    key:
      | keyof ColorSchemeRoles<T>
      | keyof ExpandColorSchemeRoles<T, CustomKeys>
      | CustomKeys
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
   * 仅支持浏览器端！
   *
   * 需要在非浏览器端使用请重写此方法！
   */
  protected updateStyles() {
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
  override get systemBright(): Bright {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * @inheritDoc
   */
  public override setMode(mode: ThemeMode): boolean {
    const result = super.setMode(mode)
    if (result) this.updateStyles()
    return result
  }

  /**
   * @inheritDoc
   */
  public override getCacheThemeMode(): ThemeMode {
    return (localStorage.getItem(this.cacheKey) || 'system') as ThemeMode
  }

  /**
   * @inheritDoc
   */
  public override clearCache() {
    localStorage.removeItem(this.cacheKey)
  }
}
