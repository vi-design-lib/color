import type { Brightness, ThemeMode } from './base-theme.js'
import { ref, type Ref, type RefFactory } from './common.js'

/**
 * 静态主题配置选项接口
 *
 * @description 提供基本的主题管理配置选项，不包含颜色方案相关配置
 */
export interface StaticThemeOptions {
  /**
   * HTML根元素用于记录主题亮度的属性名
   *
   * @description 在HTML根元素上设置的属性名，用于通过CSS选择器应用不同主题样式
   * @default 'theme'
   */
  attribute?: string

  /**
   * 缓存主题模式的key
   *
   * @description 用于在本地存储中保存主题模式的键名
   * @default '_CACHE_THEME_MODE'
   */
  cacheKey?: string

  /**
   * 默认主题模式
   *
   * @description 当未设置主题模式时使用的默认值
   * @default 'system'
   */
  defaultMode?: ThemeMode

  /**
   * ref工厂函数
   *
   * @description 用于创建响应式数据的函数
   * 如果不需要能够监听mode变化，则可以不传入
   * 支持`vitarx`和`vue3`框架中的ref函数
   * 默认为内置的一个伪ref函数
   * @default ref
   */
  refFactory?: RefFactory

  /**
   * 服务端渲染时的系统主题亮度
   *
   * @description 由于服务端无法调用浏览器端的API，所以需要设置一个默认的主题亮度
   * 可以是`light`或`dark`，默认为false，表示不在服务端渲染
   * @default false
   */
  ssr?: Brightness | false
}

/**
 * 主题管理器
 *
 * @description 仅内置了基本的Web主题管理功能，不包含颜色方案生成，需搭配主题CSS样式配合使用
 * 管理器会在HTML根元素上设置主题属性，通过CSS选择器应用不同主题样式
 *
 * @example CSS主题定义示例
 * ```css
 * html[theme="dark"] {
 *   --color: #ffffff;
 * }
 * html[theme="light"] {
 *   --color: #000000;
 * }
 * ```
 *
 * @see https://color.visdev.cn 主题色生成器
 */
export class StaticThemeManger {
  /**
   * 主题模式
   *
   * @description 存储当前的主题模式，使用Ref包装以支持响应式
   * @private
   */
  private _mode: Ref<ThemeMode>

  /**
   * 静态主题配置
   *
   * @description 存储主题管理器的所有配置选项
   * @protected
   */
  protected config: Required<StaticThemeOptions>

  /**
   * 是否为浏览器环境
   *
   * @description 判断当前是否在浏览器环境中运行
   * @protected
   */
  protected _isBrowser = typeof window === 'object' && typeof document === 'object'

  /**
   * 创建静态主题管理器
   *
   * @description 初始化主题管理器，设置默认配置，并在浏览器环境下监听系统主题变化
   * @constructor
   * @param {StaticThemeOptions} [options] - 配置选项
   * @param {string} [options.cacheKey] - 自定义缓存名称，用于在本地存储中保存主题模式
   * @param {string} [options.attribute] - 自定义HTML属性名，用于在根元素上标记主题
   * @param {RefFactory} [options.refFactory] - 自定义ref函数，用于创建响应式数据
   * @param {ThemeMode} [options.defaultMode] - 默认主题模式，当未设置主题模式时使用
   * @param {Brightness|false} [options.ssr] - 服务端渲染时的系统主题亮度
   */
  constructor(options?: StaticThemeOptions) {
    this.config = Object.assign(
      {
        attribute: 'theme',
        cacheKey: '_CACHE_THEME_MODE',
        defaultMode: 'system',
        refFactory: ref,
        ssr: false
      },
      options
    )
    this._mode = this.config.refFactory(this.getCacheThemeMode() || this.config.defaultMode)
    if (this._isBrowser) {
      // 监听系统主题变化
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // 如果是system模式，则切换主题
        if (this.mode === 'system') this.setMode(e.matches ? 'dark' : 'light')
      })
    }
  }

  /**
   * 设置主题模式
   *
   * @description 设置当前主题的模式，并在必要时更新缓存和HTML属性
   * @param {ThemeMode} mode - 要设置的主题模式
   * @returns {void}
   */
  public setMode(mode: ThemeMode): void {
    if (this.mode !== mode) {
      this._mode.value = mode
      this.setCacheThemeMode(mode)
      if (this._isBrowser) {
        document.documentElement.setAttribute(this.attribute, this.bright)
      }
    }
  }

  /**
   * 获取当前主题的亮度
   *
   * @description 根据当前主题模式返回对应的亮度，如果是system模式则返回系统亮度
   * @returns {Brightness} 当前的亮度模式
   */
  get bright(): Brightness {
    return this.mode === 'system' ? this.systemBright : this.mode
  }

  /**
   * 设置主题模式
   *
   * @description 等同于调用 `setMode` 方法，提供属性访问器语法
   * @param {ThemeMode} mode - 要设置的主题模式
   */
  set mode(mode: ThemeMode) {
    this.setMode(mode)
  }

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
   * HTML根元素用于记录主题亮度的属性名
   *
   * @description 获取在HTML根元素上设置的属性名
   * @returns {string} HTML属性名
   */
  get attribute(): string {
    return this.config.attribute
  }

  /**
   * 缓存主题模式的key
   *
   * @description 获取用于在本地存储中保存主题模式的键名
   * @returns {string} 缓存键名
   */
  get cacheKey(): string {
    return this.config.cacheKey
  }

  /**
   * 默认主题模式
   *
   * @description 获取当未设置主题模式时使用的默认值
   * @returns {ThemeMode} 默认的主题模式
   */
  get defaultMode(): ThemeMode {
    return this.config.defaultMode
  }

  /**
   * 获取系统亮度
   *
   * @description 获取当前系统的亮度模式设置，在非浏览器环境下返回ssr配置的值
   * @returns {Brightness} 系统的亮度模式
   */
  get systemBright(): Brightness {
    if (!this._isBrowser) return this.config.ssr === 'dark' ? 'dark' : 'light'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * 获取缓存的主题模式
   *
   * @description 从localStorage中获取之前缓存的主题模式
   * @returns {ThemeMode | null} 缓存的主题模式，如果没有缓存或非浏览器环境则返回null
   */
  public getCacheThemeMode(): ThemeMode | null {
    if (!this._isBrowser) return null
    return localStorage.getItem(this.config.cacheKey) as ThemeMode
  }

  /**
   * 设置缓存的主题模式
   *
   * @description 将当前主题模式保存到localStorage中
   * @param {ThemeMode} mode - 要缓存的主题模式
   * @returns {void}
   */
  public setCacheThemeMode(mode: ThemeMode): void {
    if (!this._isBrowser) return
    localStorage.setItem(this.config.cacheKey, mode)
  }

  /**
   * 清除缓存的主题模式
   *
   * @description 清除localStorage中的主题模式缓存
   * @returns {void}
   */
  public clearCache(): void {
    if (!this._isBrowser) return
    localStorage.removeItem(this.config.cacheKey)
  }
}

/**
 * 创建静态主题管理器
 *
 * @description 创建一个Web环境下的主题管理器实例，支持服务端渲染
 * 管理器只具备管理主题模式的功能，不具备生成主题样式的功能，需搭配主题CSS样式配合使用
 *
 * @param {StaticThemeOptions} [options] - 配置选项
 * @param {string} [options.cacheKey] - 自定义缓存名称，用于在本地存储中保存主题模式
 * @param {string} [options.attribute] - 自定义HTML属性名，用于在根元素上标记主题
 * @param {RefFactory} [options.refFactory] - 自定义ref函数，用于创建响应式数据
 * @param {ThemeMode} [options.defaultMode] - 默认主题模式，当未设置主题模式时使用
 * @param {Brightness|false} [options.ssr] - 服务端渲染时的系统主题亮度
 * @returns {StaticThemeManger} 主题管理器实例
 * @param {string} [options.attribute] - 自定义属性名
 * @param {RefFactory} [options.refFactory] - 自定义ref函数
 * @param {ThemeMode} [options.defaultMode] - 默认主题模式
 * @returns {StaticThemeManger} - 主题管理器实例
 */
export function createStaticTheme(options?: StaticThemeOptions): StaticThemeManger {
  return new StaticThemeManger(options)
}
