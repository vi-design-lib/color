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
import type { ComputeFormula } from '../utils/index.js'
import { ref, type Ref, type RefFactory } from './common.js'

/**
 * 亮度
 */
export type Brightness = 'light' | 'dark'
/**
 * 主题模式
 */
export type ThemeMode = Brightness | 'system'
export interface BaseThemeOptions<T extends AnyColor, CustomKeys extends string> {
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
  refFactory?: RefFactory
  /**
   * 配色算法
   *
   * @default 'triadic'
   */
  formula?: ComputeFormula
  /**
   * 色相偏移角度
   */
  angle?: number
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
 * @template T - 主题色类型
 * @template CustomKeys - 自定义配色名称
 */
export abstract class BaseTheme<T extends AnyColor, CustomKeys extends string> {
  // 主题模式
  private _mode: Ref<ThemeMode>
  // 颜色方案
  private _scheme: Ref<Scheme<ColorToColorType<T>>>
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
   * @param primary - 主色
   * @param options - 选项
   * @param options.customColorScheme - 自定义基准配色
   * @param options.varPrefix - css变量前缀
   * @param options.varSuffix - css变量后缀
   * @param options.refProxy - 自定义ref函数
   * @param options.cacheKey - 自定义缓存名称
   */
  protected constructor(primary: T, options?: BaseThemeOptions<T, CustomKeys>) {
    this.cacheKey = options?.cacheKey || '_CACHE_THEME_MODE'
    this.defaultMode = options?.defaultMode || 'system'
    const refProxy = options?.refFactory || ref
    this._mode = refProxy(this.getCacheThemeMode() || this.defaultMode)
    this._scheme = refProxy(
      createScheme(primary, {
        customColorScheme: options?.customColorScheme,
        formula: options?.formula,
        angle: options?.angle
      })
    )
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
   * @param primary - 主色
   * @param customColorScheme - 自定义配色方案
   */
  public changeColorScheme(
    primary: ColorToColorType<T>,
    customColorScheme?: Record<CustomKeys, ColorToColorType<T>>
  ) {
    this._scheme.value = createScheme(primary as unknown as T, customColorScheme)
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
  get scheme(): Readonly<Scheme<ColorToColorType<T>>> {
    return this._scheme.value
  }

  /**
   * 获取角色颜色
   *
   * @param role
   */
  role(
    role: keyof ColorSchemeRoles<T> | keyof ExpandColorSchemeRoles<ColorToColorType<T>, CustomKeys>
  ): ColorToColorType<T> {
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
