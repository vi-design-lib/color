import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'
import type { ColorSchemeRoles } from '../scheme/index.js'
import {
  createScheme,
  type InherentColorKeys,
  Scheme,
  type SchemeOptions,
  type TonalKeys,
  type Tone
} from '../scheme/index.js'
import { ref, type Ref, type RefFactory } from './common.js'
import { CACHE_THEME_MODE } from '../constant.js'

/**
 * 亮度模式
 *
 * @description 表示界面的亮度模式，可以是亮色或暗色
 */
export type Brightness = 'light' | 'dark'

/**
 * 主题模式
 *
 * @description 表示当前使用的主题模式，可以是亮色、暗色或跟随系统设置
 */
export type ThemeMode = Brightness | 'system'

/**
 * 基础主题配置选项接口
 *
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 */
export interface BaseThemeOptions<OutColorTag extends ColorTag, CustomKeys extends string>
  extends SchemeOptions<OutColorTag, CustomKeys> {
  /**
   * 缓存主题模式的key
   *
   * @description 用于在本地存储中保存主题模式的键名
   * @default CACHE_THEME_MODE
   */
  cacheKey?: string

  /**
   * 自定义ref函数
   *
   * @description 支持`vitarx`和`vue3`框架中的ref函数，用于创建响应式数据
   * @default ref
   */
  refFactory?: RefFactory

  /**
   * 默认主题模式
   *
   * @description 当未设置主题模式时使用的默认值
   * @default 'system'
   */
  defaultMode?: 'system'
}

/**
 * 主题管理抽象基类
 *
 * @description 提供主题管理的核心功能，包括主题模式切换、颜色方案管理等
 * 子类需实现以下抽象方法：
 * - getCacheThemeMode - 获取缓存的主题模式
 * - setCacheThemeMode - 缓存主题模式
 * - clearCache - 清除缓存
 * - getSystemBright - 获取系统亮度
 *
 * @template OutColorTag - 调色板输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
 */
export abstract class BaseTheme<OutColorTag extends ColorTag, CustomKeys extends string> {
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
  private schemeOptionsString: string

  /**
   * Theme构造函数
   *
   * @description 创建一个主题管理实例，初始化主题模式和颜色方案
   * @constructor
   * @param {AnyColor} primaryColor - 主色，作为整个配色方案的基础
   * @param {BaseThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项，用于自定义主题行为
   */
  protected constructor(
    primaryColor: AnyColor,
    options?: BaseThemeOptions<OutColorTag, CustomKeys>
  ) {
    const {
      refFactory = ref,
      cacheKey = CACHE_THEME_MODE,
      defaultMode = 'system',
      ...schemeOptions
    } = options || {}
    this.cacheKey = cacheKey
    this.defaultMode = defaultMode
    this._mode = refFactory(this.getCacheThemeMode() || this.defaultMode)
    this.schemeOptionsString = JSON.stringify(schemeOptions)
    this._scheme = refFactory(createScheme(primaryColor, schemeOptions))
  }

  // 主题模式
  private _mode: Ref<ThemeMode>

  /**
   * 获取主题模式
   *
   * @description 获取当前设置的主题模式
   * @returns {ThemeMode} 当前的主题模式
   */
  get mode(): ThemeMode {
    return this._mode.value
  }

  /**
   * 设置主题模式
   *
   * @description 设置当前主题的模式，会触发setMode方法
   * @param {ThemeMode} mode - 要设置的主题模式
   */
  set mode(mode: ThemeMode) {
    this.setMode(mode)
  }

  // 颜色方案
  private _scheme: Ref<Scheme<OutColorTag, CustomKeys>>

  /**
   * 配色方案实例
   *
   * @description 获取当前主题的配色方案实例
   * @returns {Readonly<Scheme<OutColorTag, CustomKeys>>} 只读的配色方案实例
   */
  get scheme(): Readonly<Scheme<OutColorTag, CustomKeys>> {
    return this._scheme.value
  }

  /**
   * 获取当前主题的亮度
   *
   * @description 根据当前主题模式返回对应的亮度，如果是system模式则返回系统亮度
   * @returns {Brightness} 当前的亮度模式
   */
  get bright(): Brightness {
    const mode = this.mode
    return mode === 'system' ? this.systemBright : mode
  }

  /**
   * 获取系统亮度
   *
   * @description 获取当前系统的亮度模式设置
   * @returns {Brightness} 系统的亮度模式
   * @abstract
   */
  abstract get systemBright(): Brightness

  /**
   * 设置主题模式
   *
   * @description 设置当前主题的模式，并在必要时更新缓存
   * @param {ThemeMode} mode - 要设置的主题模式
   * @return {boolean} - 是否成功更新了主题模式（亮度发生变化返回true）
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
   * 动态切换颜色方案
   *
   * @description 根据新的主色和选项重新创建颜色方案
   * @param {AnyColor} primaryColor - 新的主色
   * @param {SchemeOptions<OutColorTag, CustomKeys>} [options] - 可选的配色选项
   */
  public changeColorScheme(
    primaryColor: AnyColor,
    options?: SchemeOptions<OutColorTag, CustomKeys>
  ) {
    this._scheme.value = createScheme(primaryColor, options)
    // 更新配色方案选项字符串
    this.schemeOptionsString = JSON.stringify(options ?? {})
  }

  /**
   * 获取角色颜色
   *
   * @description 根据当前亮度模式获取指定角色的颜色
   * @param {keyof ColorSchemeRoles<CustomKeys, OutColorTag>} role - 颜色角色名称
   * @returns {ColorTagToColorType<OutColorTag>} 对应角色的颜色值
   */
  role(role: keyof ColorSchemeRoles<CustomKeys, OutColorTag>): ColorTagToColorType<OutColorTag> {
    return this.scheme[this.bright].roles[role] as ColorTagToColorType<OutColorTag>
  }

  /**
   * 获取色调颜色
   *
   * @description 根据当前亮度模式获取指定方案和色调的颜色
   * @param {InherentColorKeys | CustomKeys} scheme - 颜色方案名称
   * @param {Tone} tone - 色调值，范围1-10
   * @returns {ColorTagToColorType<OutColorTag>} 对应色调的颜色值
   * @throws {Error} 当色调值无效或方案不存在时抛出错误
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
   * 获取缓存的主题模式
   *
   * @description 从持久化存储中获取之前缓存的主题模式
   * @returns {ThemeMode | undefined | null} 缓存的主题模式，如果没有缓存则返回null或undefined
   * @abstract
   */
  public abstract getCacheThemeMode(): ThemeMode | undefined | null

  /**
   * 清除缓存
   *
   * @description 清除持久化存储中的主题模式缓存
   * @abstract
   */
  public abstract clearCache(): void

  /**
   * 缓存主题模式
   *
   * @description 将当前主题模式保存到持久化存储中
   * @param {ThemeMode} mode - 要缓存的主题模式
   * @protected
   */
  protected abstract setCacheThemeMode(mode: ThemeMode): void
}
