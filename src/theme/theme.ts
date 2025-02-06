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
}
/**
 * 主题管理类
 *
 * 依赖浏览器端`CSSStyleSheet`和`matchMedia`特性，自动生成css变量样式表，支持动态切换主题。
 */
export class Theme<T extends AnyColor, CustomKeys extends string> {
  // 主题模式
  private _mode: Ref<ThemeMode>
  // 样式表
  private readonly sheet: CSSStyleSheet
  // 颜色方案
  private _scheme: Ref<Scheme<ColorToColorType<T>>>
  // 选项
  private options: Required<ThemeOptions<T, CustomKeys>>
  constructor(primary: T, options?: ThemeOptions<T, CustomKeys>) {
    this.options = Object.assign(
      {
        cacheKey: '_CACHE_THEME_MODE',
        refProxy: ref,
        customColorScheme: {}
      },
      options
    )
    this.sheet = this.createStyleSheet()
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
    document.body.setAttribute('data-theme', this.bright)
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
  roles(role: keyof ColorSchemeRoles<T> | CustomKeys) {
    return this.scheme[this.bright].roles[role as keyof ColorSchemeRoles<T>]
  }

  /**
   * 获取色调颜色
   *
   * @param role
   * @param tone
   */
  tonal(role: ColorSchemeKeys | CustomKeys, tone: Tone) {
    if (this.bright === 'dark') {
      return this.scheme.tonalPalettes[role as ColorSchemeKeys].all().reverse()[tone - 1]
    } else {
      return this.scheme.tonalPalettes[role as ColorSchemeKeys].get(tone - 1)
    }
  }

  /**
   * 获取css变量
   *
   * @param {} key
   * @return {string} css变量
   */
  cssVar(
    key:
      | keyof ColorSchemeRoles<T>
      | keyof ExpandColorSchemeRoles<T, CustomKeys>
      | CustomKeys
      | TonalKeys
      | `${CustomKeys}-${Tone}`
  ): `var(--color-${string})` {
    return `var(--color-${camelToKebab(key)})`
  }

  /**
   * 更新样式
   *
   * @private
   */
  protected updateStyles() {
    while (this.sheet.cssRules.length > 0) {
      this.sheet.deleteRule(0)
    }
    const generateRoleStyles = (scheme: Scheme<AnyColor>, theme: 'dark' | 'light') => {
      return Object.keys(scheme[theme].roles)
        .map((rule) => {
          const color = scheme[theme].roles[rule as 'primary']
          return `--color-${camelToKebab(rule)}: ${color};`
        })
        .join('\n')
    }

    const generateTonalStyles = (scheme: Scheme<AnyColor>, theme: 'dark' | 'light') => {
      return Object.entries(scheme[theme].tonal)
        .map(([key, value]) => {
          return `--color-${camelToKebab(key)}: ${anyColorToHexColor(value)};`
        })
        .join('\n')
    }

    const lightStyles =
      generateRoleStyles(this.scheme, 'light') + generateTonalStyles(this.scheme, 'light')
    const darkStyles =
      generateRoleStyles(this.scheme, 'dark') + generateTonalStyles(this.scheme, 'dark')
    this.sheet.insertRule(`html[data-theme="light"]{${lightStyles}}`, 0)
    this.sheet.insertRule(`html[data-theme="dark"]{${darkStyles}}`, 1)
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
