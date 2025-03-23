import type {
  AnyColor,
  ColorSchemeKeys,
  ColorSchemeRoles,
  ColorToColorType,
  ExpandColorSchemeRoles,
  TonalKeys,
  Tone
} from '../types.js'
import { createScheme, Scheme } from '../scheme/index.js'
import { anyColorToHexColor, camelToKebab } from '../utils/index.js'

/**
 * 亮度
 */
export type Bright = 'light' | 'dark'
/**
 * 主题模式
 */
export type ThemeMode = Bright | 'system'
type RefFn = <T>(value: T) => { value: T }
type Ref<T> = { value: T }
const ref = <T>(value: T): Ref<T> => {
  return { value }
}
export interface ThemeOptions<T extends AnyColor, CustomKeys extends string> {
  /**
   * 自定义颜色方案
   *
   * 如果和{@linkcode ColorSchemeKeys}配色重名，则可以覆盖配色方案
   *
   * @default {}
   */
  customColorScheme?: Record<CustomKeys, ColorToColorType<T>>
  /**
   * 缓存主题模式的key
   *
   * @default '_CACHE_THEME_MODE'
   */
  cacheKey?: string
  /**
   * 自定义ref函数
   *
   * 支持`vitarx`和`vue3`框架中的ref函数
   *
   * @default ref
   */
  refProxy?: RefFn
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
}
/**
 * 主题管理类
 *
 * 依赖浏览器端`CSSStyleSheet`和`matchMedia`特性，自动生成css变量样式表，支持动态切换主题。
 *
 * @template T - 主题色类型
 * @template CustomKeys - 自定义配色名称
 */
export class Theme<T extends AnyColor, CustomKeys extends string> {
  // 主题模式
  private _mode: Ref<ThemeMode>
  // 样式表
  private readonly _sheet: CSSStyleSheet
  // 颜色方案
  private _scheme: Ref<Scheme<ColorToColorType<T>>>
  // 选项
  private options: Required<ThemeOptions<T, CustomKeys>>

  constructor(primary: T, options?: ThemeOptions<T, CustomKeys>) {
    this.options = Object.assign(
      {
        cacheKey: '_CACHE_THEME_MODE',
        refProxy: ref,
        customColorScheme: {},
        varPrefix: '--color-',
        varSuffix: ''
      },
      options
    )
    // 避免空前缀
    if (!this.options.varPrefix) this.options.varPrefix = '--'
    this._sheet = this.createStyleSheet()
    this._mode = this.options.refProxy(this.getCacheThemeMode())
    this._scheme = this.options.refProxy(createScheme(primary, this.options.customColorScheme))
    this.updateStyles()
  }

  /**
   * 创建一个样式表
   *
   * @returns {CSSStyleSheet} - CSSStyleSheet。
   */
  private createStyleSheet(): CSSStyleSheet {
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
   * css变量前缀
   */
  get varPrefix() {
    return this.options.varPrefix
  }

  /**
   * css变量后缀
   */
  get varSuffix() {
    return this.options.varSuffix
  }

  /**
   * 设置主题模式
   *
   * @param mode
   * @protected
   */
  set mode(mode: ThemeMode) {
    const oldBright = this.bright
    this._mode.value = mode
    if (this.bright === oldBright) return
    // 缓存主题
    localStorage.setItem(this.options.cacheKey, mode)
    // 切换样式
    document.documentElement.setAttribute('data-theme', this.bright)
    this.updateStyles()
  }

  /**
   * 获取主题模式
   */
  get mode() {
    return this._mode.value
  }

  /**
   * 动态切换颜色方案
   *
   * @param primary
   * @param customColorScheme
   */
  public changeColorScheme(
    primary: ColorToColorType<T>,
    customColorScheme?: Record<CustomKeys, ColorToColorType<T>>
  ) {
    this._scheme.value = createScheme(primary as unknown as T, customColorScheme)
    this.updateStyles()
  }

  /**
   * 获取当前主题的亮度
   */
  get bright(): Bright {
    const mode = this.mode
    return mode === 'system' ? Theme.systemBright : mode
  }

  /**
   * 获取当前主题的颜色方案
   */
  get scheme(): Readonly<Scheme<ColorToColorType<T>>> {
    return this._scheme.value
  }

  /**
   * 获取角色颜色
   *
   * @param role
   */
  role(role: keyof ColorSchemeRoles<T> | CustomKeys): ColorToColorType<T> {
    return this.scheme[this.bright].roles[role as keyof ColorSchemeRoles<T>]
  }

  /**
   * 获取色调颜色
   *
   * @param scheme
   * @param tone
   */
  tonal(scheme: ColorSchemeKeys | CustomKeys, tone: Tone): ColorToColorType<T> {
    if (tone < 1 || tone > 10) {
      throw new Error(`Invalid tone value: ${tone}. Tone must be between 1 and 10.`)
    }
    const name = `${scheme}-${tone}` as TonalKeys
    const color = this.scheme[this.bright].tonal[name]
    if (color === undefined) {
      throw new Error(`Invalid scheme : ${scheme}. not found`)
    }
    return color
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
   * 更新样式
   *
   * @private
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
    this._sheet.insertRule(`html[data-theme="light"]{${lightStyles}}`, 0)
    this._sheet.insertRule(`html[data-theme="dark"]{${darkStyles}}`, 1)
  }

  /**
   * 获取系统亮度
   */
  static get systemBright(): Bright {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * 获取缓存的主题
   */
  private getCacheThemeMode(): ThemeMode {
    return (localStorage.getItem(this.options.cacheKey) || 'system') as ThemeMode
  }

  /**
   * 清除缓存
   */
  public clearCache() {
    localStorage.removeItem(this.options.cacheKey)
  }
}
