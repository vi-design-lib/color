import { type BrightnessScheme, type SchemeOptions } from '../scheme/index.js'
import { anyColorToHexColor, anyColorToRgbObject, camelToKebab } from '../utils/index.js'
import { BaseTheme, type BaseThemeOptions, type Brightness, type ThemeMode } from './base-theme.js'
import type { AnyColor, ColorTag } from '../types.js'

export interface WebThemeOptions<OutColorTag extends ColorTag, CustomKeys extends string>
  extends BaseThemeOptions<OutColorTag, CustomKeys> {
  /**
   * CSS变量前缀，默认 `--color-`
   * > 注意：必须以 `--` 开头
   */
  varPrefix?: string
  /**
   * CSS变量后缀，默认空字符串
   */
  varSuffix?: string
  /**
   * HTML根元素上记录主题亮度的属性名
   * @default 'theme'
   */
  attribute?: string
  /**
   * SSR 默认主题亮度（light/dark），false 表示禁用 SSR 模式
   * @default false
   */
  ssr?: Brightness | false
}

/**
 * Web 环境主题管理类
 *
 * @template OutColorTag 输出颜色类型
 * @template CustomKeys 自定义配色名称
 */
export class WebTheme<
  OutColorTag extends ColorTag,
  CustomKeys extends string = never
> extends BaseTheme<OutColorTag, CustomKeys> {
  /** 是否为浏览器环境 */
  protected static readonly _isBrowser =
    typeof window !== 'undefined' && typeof document !== 'undefined'

  public readonly varPrefix: string
  public readonly varSuffix: string
  public readonly attribute: string
  protected readonly ssr: Brightness | false
  private readonly _sheet?: CSSStyleSheet

  constructor(primaryColor: AnyColor, options?: WebThemeOptions<OutColorTag, CustomKeys>) {
    const {
      attribute = 'theme',
      varPrefix = '--color-',
      varSuffix = '',
      ssr = false,
      ...rest
    } = options || {}

    super(primaryColor, rest)

    this.attribute = attribute
    this.varPrefix = varPrefix
    this.varSuffix = varSuffix
    this.ssr = ssr

    if (!WebTheme._isBrowser) return

    // 初始化 DOM 属性
    document.documentElement.setAttribute(this.attribute, this.bright)

    // 创建样式表
    this._sheet = WebTheme.createStyleSheet()

    // 更新样式
    this.updateStyles()

    // 监听系统主题变化
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    mq.addEventListener('change', (e) => {
      if (this.mode === 'system') this.setMode(e.matches ? 'dark' : 'light')
    })
  }

  /** @inheritDoc */
  override get systemBright(): Brightness {
    if (!WebTheme._isBrowser) return this.ssr === 'dark' ? 'dark' : 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /** @inheritDoc */
  override setMode(mode: ThemeMode): boolean {
    const result = super.setMode(mode)
    if (result && WebTheme._isBrowser) {
      document.documentElement.setAttribute(this.attribute, this.bright)
      this.updateStyles()
    }
    return result
  }

  /**
   * 动态切换颜色方案
   *
   * 允许在运行时重新设置配置方案，并更新样式表。
   *
   * @param primaryColor - 主色
   * @param options - 颜色方案配置
   */
  override changeColorScheme(
    primaryColor: AnyColor,
    options?: SchemeOptions<OutColorTag, CustomKeys>
  ) {
    super.changeColorScheme(primaryColor, options)
    this.updateStyles()
  }

  /** @inheritDoc */
  protected override removeCache(name: string): void {
    if (typeof localStorage !== 'object') return
    localStorage.removeItem(name)
  }

  /** @inheritDoc */
  protected override setCache(name: string, value: string): void {
    if (typeof localStorage !== 'object') return
    localStorage.setItem(name, value)
  }

  /** @inheritDoc */
  protected override getCache(name: string): string | null {
    if (typeof localStorage !== 'object') return null
    return localStorage.getItem(name)
  }

  /** 创建样式表 */
  public static createStyleSheet(): CSSStyleSheet {
    try {
      const cssSheet = new CSSStyleSheet()
      document.adoptedStyleSheets.push(cssSheet)
      return cssSheet
    } catch {
      const style = document.createElement('style')
      style.appendChild(document.createComment('此样式表由 @vi-design/color 管理，请勿修改。'))
      document.head.append(style)
      return style.sheet!
    }
  }

  /** 获取 CSS 变量（带 var() 包装） */
  cssVar(key: string): `var(${string})` {
    return `var(${this.varName(key)})`
  }

  /** 获取 CSS 变量名（不带 var()） */
  varName(key: string): `--${string}` {
    return `${this.varPrefix}${camelToKebab(key)}${this.varSuffix}` as `--${string}`
  }

  /** 更新样式表 */
  protected updateStyles(): void {
    if (!this._sheet) return

    // 清空旧样式
    while (this._sheet.cssRules.length > 0) this._sheet.deleteRule(0)

    const fixedRoles: string[] = []

    const buildStyles = (
      scheme: BrightnessScheme<CustomKeys, OutColorTag>,
      theme: Brightness
    ): string => {
      const roles = Object.entries(scheme[theme].roles)
        .map(([key, color]) => {
          const rgb = Object.values(anyColorToRgbObject(color)).join(', ')
          const name = this.varName(key)
          if (theme === 'light')
            fixedRoles.push(`${name}-fixed: ${color};\n${name}-fixed-rgb: ${rgb};`)
          return `${name}: ${color};\n${name}-rgb: ${rgb};`
        })
        .join('\n')

      const tones = Object.entries(scheme[theme].tonal)
        .map(([key, value]) => {
          const name = this.varName(key)
          const hex = anyColorToHexColor(value)
          if (theme === 'light') fixedRoles.push(`${name}-fixed: ${hex};`)
          return `${name}: ${hex};`
        })
        .join('\n')

      return roles + tones
    }

    const lightStyles = buildStyles(this.scheme, 'light')
    const darkStyles = buildStyles(this.scheme, 'dark')
    const fixedStyles = fixedRoles.join('\n')
    this._sheet.insertRule(`html[${this.attribute}="light"]{${lightStyles}}`, 0)
    this._sheet.insertRule(`html[${this.attribute}="dark"]{${darkStyles}}`, 1)
    this._sheet.insertRule(`html{${fixedStyles}}`, 2)
  }
}

/**
 * 创建Web主题实例
 *
 * @description 创建一个Web环境下的主题管理实例，自动生成CSS变量并支持动态切换主题
 * 如果你使用的是 `Vitarx` 或 `Vue3` 框架，则指定 `options.refFactory` 为框架提供的 `ref` 函数，
 * 这样可以让 role 和 tonal 获取的颜色具有响应性
 *
 * @template OutColorTag - 输出的颜色类型
 * @template CustomKeys - 自定义配色角色key
 * @param {AnyColor} primaryColor - 主色
 * @param {WebThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {Record<CustomKeys, AnyColor>} [options.customColor] - 自定义基准配色
 * @param {string} [options.varPrefix=--color-] - CSS变量前缀
 * @param {string} [options.varSuffix] - CSS变量后缀
 * @param {RefFactory} [options.refFactory] - 自定义ref函数
 * @param {string} [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param {ComputeFormula} [options.formula=triadic] - 配色方案算法
 * @param {number} [options.angle] - 色相偏移角度
 * @param {Brightness|false} [options.ssr] - 服务端渲染时的系统主题亮度
 * @returns {WebTheme<OutColorTag, CustomKeys>} 主题实例
 */
export function createWebTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  primaryColor: AnyColor,
  options?: WebThemeOptions<OutColorTag, CustomKeys>
): WebTheme<OutColorTag, CustomKeys> {
  return new WebTheme(primaryColor, options)
}
