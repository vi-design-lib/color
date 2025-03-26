import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'
import { createScheme, Scheme } from '../scheme/index.js'
import { ref, type Ref, type RefFactory } from './common.js'
import type { InherentColorKeys, SchemeOptions, TonalKeys, Tone } from '../scheme/types.js'
import type { ColorSchemeRoles } from '../scheme/types/index.js'

/**
 * 亮度
 */
export type Brightness = 'light' | 'dark'
/**
 * 主题模式
 */
export type ThemeMode = Brightness | 'system'

export interface BaseThemeOptions<OutColorTag extends ColorTag, CustomKeys extends string>
  extends SchemeOptions<OutColorTag, CustomKeys> {
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
  refFactory?: RefFactory
  /**
   * 默认主题模式
   */
  defaultMode?: 'system'
}

/**
 * 主题管理抽象基类
 *
 * 需实现抽象方法：
 * - getCacheThemeMode
 * - cacheThemeMode
 * - clearCache
 * - getSystemBright
 *
 * @template OutColorTag - 调色板输出的颜色标签
 * @template CustomKeys - 自定义颜色键
 */
export abstract class BaseTheme<OutColorTag extends ColorTag, CustomKeys extends string> {
  // 主题模式
  private _mode: Ref<ThemeMode>
  // 颜色方案
  private _scheme: Ref<Scheme<OutColorTag, CustomKeys>>
  /**
   * 缓存名称
   */
  public readonly cacheKey: string
  /**
   * 默认主题模式
   *
   * @private
   */
  public readonly defaultMode: 'system'

  /**
   * Theme构造函数
   *
   * @constructor
   * @param {AnyColor} mainColor - 主色
   * @param {BaseThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项
   */
  protected constructor(mainColor: AnyColor, options?: BaseThemeOptions<OutColorTag, CustomKeys>) {
    this.cacheKey = options?.cacheKey || '_CACHE_THEME_MODE'
    const {
      refFactory = ref,
      cacheKey = '_CACHE_THEME_MODE',
      defaultMode = 'system',
      ...SchemeOptions
    } = options || {}
    this.cacheKey = cacheKey
    this.defaultMode = defaultMode
    this._mode = refFactory(this.getCacheThemeMode() || this.defaultMode)
    this._scheme = refFactory(createScheme(mainColor, SchemeOptions))
  }

  /**
   * 设置主题模式
   *
   * @param mode - 主题模式
   */
  set mode(mode: ThemeMode) {
    this.setMode(mode)
  }

  /**
   * 设置主题模式
   *
   * @param {ThemeMode} mode - 亮度模式
   * @return {boolean} - 是否更新了主题模式
   */
  public setMode(mode: ThemeMode): boolean {
    const oldBright = this.bright
    this._mode.value = mode
    if (this.bright === oldBright) return false
    // 缓存主题
    this.setCacheThemeMode(mode)
    return true
  }

  /**
   * 缓存主题模式
   *
   * @param {ThemeMode} mode - 主题模式
   * @protected
   */
  protected abstract setCacheThemeMode(mode: ThemeMode): void

  /**
   * 获取主题模式
   */
  get mode() {
    return this._mode.value
  }

  /**
   * 动态切换颜色方案
   *
   * @param { AnyColor } mainColor - 主色
   * @param {SchemeOptions<OutColorTag, CustomKeys>} [options] - 可选的配色选项
   */
  public changeColorScheme(mainColor: AnyColor, options?: SchemeOptions<OutColorTag, CustomKeys>) {
    this._scheme.value = createScheme(mainColor, options)
  }

  /**
   * 获取当前主题的亮度
   */
  get bright(): Brightness {
    const mode = this.mode
    return mode === 'system' ? this.systemBright : mode
  }

  /**
   * 配色方案实例
   */
  get scheme(): Readonly<Scheme<OutColorTag, CustomKeys>> {
    return this._scheme.value
  }

  /**
   * 获取角色颜色
   *
   * @param {keyof ColorSchemeRoles<CustomKeys, never>} role
   */
  role(role: keyof ColorSchemeRoles<CustomKeys, OutColorTag>): ColorTagToColorType<OutColorTag> {
    return this.scheme[this.bright].roles[role] as ColorTagToColorType<OutColorTag>
  }

  /**
   * 获取色调颜色
   *
   * @param scheme
   * @param tone
   */
  tonal(scheme: InherentColorKeys | CustomKeys, tone: Tone): ColorTagToColorType<OutColorTag> {
    if (tone < 1 || tone > 10) {
      throw new Error(`Invalid tone value: ${tone}. Tone must be between 1 and 10.`)
    }
    const name = `${scheme}-${tone}` as TonalKeys<CustomKeys>
    const color = this.scheme[this.bright].tonal[name]
    if (color === undefined) {
      throw new Error(`Invalid scheme : ${scheme}. not found`)
    }
    return color
  }

  /**
   * 获取系统亮度
   *
   * @returns {Brightness}
   */
  abstract get systemBright(): Brightness

  /**
   * 获取缓存的主题
   *
   * 如果没有缓存则返回null或undefined
   */
  public abstract getCacheThemeMode(): ThemeMode | undefined | null

  /**
   * 清除缓存
   */
  public abstract clearCache(): void
}
