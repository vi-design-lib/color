import type { Brightness, ThemeMode } from './base-theme.js'
import { ref, type Ref, type RefFactory } from './common.js'

export interface StaticThemeOptions {
  /**
   * HTML根元素用于记录主题亮度的属性名
   *
   * @default 'theme'
   */
  attribute?: string
  /**
   * 缓存主题模式的key
   */
  cacheKey?: string
  /**
   * 默认主题模式
   */
  defaultMode?: ThemeMode
  /**
   * ref工厂函数
   *
   * 如果不需要能够监听mode变化，则可以不传入
   *
   * 支持`vitarx`和`vue3`框架中的ref函数
   *
   * 默认为内置的一个伪ref函数
   */
  refFactory?: RefFactory
  /**
   * 服务端渲染时的系统主题亮度
   *
   * 由于服务端调用浏览器端的api，所以需要设置一个默认的主题亮度，可以是`light`或`dark`
   *
   * @default false
   */
  ssr?: Brightness | false
}

/**
 * 主题管理器
 *
 * 仅内置了基本的Web主题管理功能，需搭配主题css样式配合使用。
 *
 * @example css主题定义示例
 * html[theme="dark"]{--color: #ffffff;}
 * html[theme="light"]{--color: #ffffff;}
 *
 * @see https://color.visdev.cn 主题色生成器
 */
export class WebThemeManger {
  /**
   * 主题模式
   *
   * @private
   */
  private _mode: Ref<ThemeMode>
  /**
   * 静态主题
   *
   * @protected
   */
  protected config: Required<StaticThemeOptions>

  /**
   * 是否为浏览器环境
   *
   * @private
   */
  protected _isBrowser = typeof window === 'object' && typeof document === 'object'

  /**
   * 创建静态主题
   *
   * @param {StaticThemeOptions} [options] - 配置选项
   * @param {string} [options.cacheKey] - 自定义缓存名称
   * @param {string} [options.attribute] - 自定义属性名
   * @param {RefFactory} [options.refFactory] - 自定义ref函数
   * @param {ThemeMode} [options.defaultMode] - 默认主题模式
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
   * @param {ThemeMode} mode
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
   */
  get bright(): Brightness {
    return this.mode === 'system' ? this.systemBright : this.mode
  }

  /**
   * 等同于调用 `setMode`
   */
  set mode(mode: ThemeMode) {
    this.setMode(mode)
  }

  /**
   * 获取主题模式
   */
  get mode() {
    return this._mode.value
  }

  /**
   * HTML根元素用于记录主题亮度的属性名
   */
  get attribute() {
    return this.config.attribute
  }

  /**
   * 缓存主题模式的key
   */
  get cacheKey() {
    return this.config.cacheKey
  }

  /**
   * 默认主题模式
   */
  get defaultMode() {
    return this.config.defaultMode
  }

  /**
   * 获取系统亮度
   *
   * @returns {Brightness} 系统主题
   */
  get systemBright(): Brightness {
    if (!this._isBrowser) return this.config.ssr === 'light' ? 'light' : 'dark'
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  /**
   * 获取缓存的主题
   */
  public getCacheThemeMode(): ThemeMode | null {
    if (!this._isBrowser) return null
    return localStorage.getItem(this.config.cacheKey) as ThemeMode
  }

  /**
   * 设置缓存的主题
   */
  public setCacheThemeMode(mode: ThemeMode): void {
    if (!this._isBrowser) return
    localStorage.setItem(this.config.cacheKey, mode)
  }

  /**
   * 清除缓存的主题
   */
  public clearCache(): void {
    if (!this._isBrowser) return
    localStorage.removeItem(this.config.cacheKey)
  }
}

/**
 * 创建WEB主题管理器（支持服务端渲染）
 *
 * 管理器只具备管理主题模式的功能，不具备生成主题样式的功能，需搭配主题样式css样式配合使用。
 *
 * @param {StaticThemeOptions} [options] - 配置选项
 * @param {string} [options.cacheKey] - 自定义缓存名称
 * @param {string} [options.attribute] - 自定义属性名
 * @param {RefFactory} [options.refFactory] - 自定义ref函数
 * @param {ThemeMode} [options.defaultMode] - 默认主题模式
 * @returns {WebThemeManger} - 主题管理器实例
 */
export function createStaticTheme(options?: StaticThemeOptions): WebThemeManger {
  return new WebThemeManger(options)
}
