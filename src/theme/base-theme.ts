import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'
import type { BrightnessScheme, ColorSchemeRoles } from '../scheme/index.js'
import {
  createScheme,
  type InherentColorKeys,
  type SchemeOptions,
  type TonalKeys,
  type Tone
} from '../scheme/index.js'
import { hashStringTo32Bit, ref, type Ref, type RefFactory } from './common.js'
import { CACHE_THEME_MODE, VERSION } from '../constant.js'

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
 * 监听函数
 */
export type Observer = (newMode: ThemeMode, oldMode: ThemeMode) => void

/**
 * 主题管理的基础抽象类，提供主题模式切换和颜色方案管理的核心功能。
 *
 * 该类实现了主题系统的基本架构，包括：
 * - 主题模式管理（亮色/暗色/系统模式）
 * - 颜色方案缓存和动态切换
 * - 亮度方案的角色色和色调访问
 * - 主题配置的持久化存储
 *
 * @example
 * // 继承BaseTheme实现自定义主题
 * class CustomTheme extends BaseTheme<'hex', 'custom'> {
 *   get systemBright() {
 *     return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
 *   }
 *
 *   protected getCache(name: string): string | null {
 *     return localStorage.getItem(name);
 *   }
 *
 *   protected setCache(name: string, value: string): void {
 *     localStorage.setItem(name, value);
 *   }
 *
 *   protected removeCache(name: string): void {
 *     localStorage.removeItem(name);
 *   }
 *
 *   public getCacheThemeMode(): ThemeMode | undefined | null {
 *     return localStorage.getItem('theme') as ThemeMode;
 *   }
 * }
 *
 * // 使用主题
 * const theme = new CustomTheme('#ff0000');
 * theme.mode = 'dark';
 * const primaryColor = theme.role('primary');
 *
 * @constructor
 * @param {AnyColor} primaryColor - 主色，作为整个配色方案的基础颜色
 * @param {BaseThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项，包含：
 *   - refFactory: 响应式引用工厂函数（可选）
 *   - cacheKey: 缓存键名（可选，默认为CACHE_THEME_MODE）
 *   - defaultMode: 默认主题模式（可选，默认为'system'）
 *   - 其他方案配置选项
 *
 * @abstract
 * @template OutColorTag - 输出颜色标签类型
 * @template CustomKeys - 自定义键名类型
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
  /**
   * 方案
   * @protected
   */
  protected brightScheme: Ref<BrightnessScheme<CustomKeys, OutColorTag>>
  /**
   * 配色方案的hash值
   *
   * @private
   */
  private _schemeHash: string
  private readonly _observer = new Set<Observer>()

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
    // 初始化缓存key
    this.cacheKey = cacheKey
    // 初始化主题模式
    this.defaultMode = defaultMode
    // 初始化主题模式
    this._mode = refFactory(this.getCacheThemeMode() || this.defaultMode)
    // 初始化配色方案hash
    this._schemeHash = this.createSchemeHash(primaryColor, options)
    // 获取缓存的配色方案
    let scheme = this.getCacheScheme()
    if (!scheme) {
      scheme = createScheme(primaryColor, schemeOptions).bright
      this.saveCacheScheme(scheme)
    }
    // 初始化配色方案
    this.brightScheme = refFactory(scheme)
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

  /**
   * 亮度配色方案对象
   *
   * @returns {Readonly<BrightnessScheme<OutColorTag, CustomKeys>>} 只读的配色方案实例
   */
  get scheme(): Readonly<BrightnessScheme<CustomKeys, OutColorTag>> {
    return this.brightScheme.value
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
   * 获取缓存方案的键值
   * 该属性用于生成一个特定的缓存键，用于标识不同的缓存方案
   * @returns {string} 返回一个由基础缓存键、方案标识和方案哈希值组成的字符串
   */
  protected get cacheSchemeKey(): string {
    return `${this.cacheKey}_SCHEME_${this._schemeHash}`
  }

  /**
   * 设置主题模式
   *
   * @description 设置当前主题的模式，并在必要时更新缓存
   * @param {ThemeMode} mode - 要设置的主题模式
   * @return {boolean} - 是否成功更新了主题模式（亮度发生变化返回true）
   */
  public setMode(mode: ThemeMode): boolean {
    if (mode === this._mode.value) return false
    this._observer.forEach((fn) => fn(mode, this._mode.value))
    const oldBright = this.bright
    this._mode.value = mode
    if (this.bright === oldBright) return false
    // 缓存主题模式
    this.setCache(`${this.cacheKey}MODE`, mode)
    return true
  }

  /**
   * 注册观察者模式中的观察者对象
   *
   * 当模式发生变化时，所有注册的观察者都会收到通知
   *
   * @param observer - 需要添加到观察者列表的观察者函数
   */
  public onModeChange(observer: Observer): void {
    this._observer.add(observer) // 将回调函数添加到观察者列表中
  }

  /**
   * 停止监听模式变化
   * @param observer - 需要移除的观察者函数
   */
  public offModeChange(observer: Observer): void {
    this._observer.delete(observer) // 将回调函数从观察者列表中删除
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
    const scheme = createScheme(primaryColor, options).bright
    // 更新配色方案hash
    this._schemeHash = this.createSchemeHash(primaryColor, options)
    // 更新配色方案
    this.brightScheme.value = scheme
    this.saveCacheScheme(scheme)
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
   * @returns {ThemeMode | undefined | null} 缓存的主题模式，如果没有缓存则返回null
   */
  public getCacheThemeMode(): ThemeMode | null {
    return (this.getCache(`${this.cacheKey}MODE`) || null) as ThemeMode | null
  }

  /**
   * 清除缓存的方法
   *
   * 该方法会清除当前保存的亮度模式和配色方案
   */
  public clearCache(): void {
    // 清除主缓存键对应的缓存
    this.removeCache(`${this.cacheKey}MODE`)
    // 清除缓存方案键对应的缓存
    this.removeCache(this.cacheSchemeKey)
    // 清除最后一次应用的方案
    this.removeCache(`${this.cacheKey}LAST_SCHEME`)
  }

  /**
   * 切换亮色/暗色模式的方法
   * 根据当前模式切换到另一种模式
   */
  public toggleBright() {
    // 使用三元运算符判断当前模式，并进行切换
    // 如果当前是亮色模式(light)，则切换为暗色模式(dark)
    // 如果当前是暗色模式(dark)，则切换为亮色模式(light)
    this.mode = this.bright === 'light' ? 'dark' : 'light'
  }

  /**
   * 保存缓存方案的方法
   * 将当前方案对象转换为JSON字符串并保存到缓存中
   * 使用缓存键值 cacheSchemeKey 作为标识
   */
  protected saveCacheScheme(scheme?: BrightnessScheme<CustomKeys, OutColorTag>) {
    const key = this.cacheSchemeKey
    // 将当前方案对象转换为JSON字符串并设置到缓存中
    this.setCache(key, JSON.stringify(scheme ?? this.scheme))
    // 保存当前方案名称到缓存中
    this.setCache(`${this.cacheKey}LAST_SCHEME`, key)
  }

  /**
   * 删除缓存
   *
   * 这是一个抽象方法，需要在子类中实现具体逻辑
   *
   * @param {string} name - 要删除的缓存名称
   */
  protected abstract removeCache(name: string): void

  /**
   * 设置缓存值
   *
   * 这是一个抽象方法，需要在子类中实现具体逻辑
   *
   * @param name 缓存名称
   * @param value 缓存值
   */
  protected abstract setCache(name: string, value: string): void

  /**
   * 获取指定名称的缓存值
   *
   * 这是一个抽象方法，需要在子类中实现具体逻辑
   *
   * @param name 缓存的名称/键
   * @returns {string|null} 返回缓存的值，如果不存在则返回null
   */
  protected abstract getCache(name: string): string | null

  /**
   * 获取缓存中的亮度方案
   *
   * @returns {null | BrightnessScheme<CustomKeys, OutColorTag>} 返回解析后的亮度方案对象，如果缓存中不存在则返回null
   */
  protected getCacheScheme(): null | BrightnessScheme<CustomKeys, OutColorTag> {
    // 尝试从缓存中获取方案数据
    const scheme = this.getCache(this.cacheSchemeKey)
    // 如果缓存中没有找到方案，则返回null
    if (!scheme) return null
    // 将缓存中的JSON字符串解析为BrightnessScheme对象并返回
    return JSON.parse(scheme) as BrightnessScheme<CustomKeys, OutColorTag>
  }

  /**
   * 创建配色方案哈希值
   *
   * @param primaryColor 主色调颜色值
   * @param schemeOptions 配色方案选项，包含自定义键和输出颜色标签
   * @returns {string} 返回一个32位的哈希值
   */
  private createSchemeHash(
    primaryColor: AnyColor, // 主色调，可以是任意颜色类型
    schemeOptions: SchemeOptions<OutColorTag, CustomKeys> | undefined // 配色方案选项，可能包含自定义键和输出颜色标签，也可以是undefined
  ): string {
    // 将主色调和配色方案选项序列化为JSON字符串后拼接，并生成32位哈希值
    return hashStringTo32Bit(
      JSON.stringify(primaryColor) + JSON.stringify(schemeOptions) + '_' + VERSION
    )
  }
}
