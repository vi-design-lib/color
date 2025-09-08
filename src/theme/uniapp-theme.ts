// @ts-ignore
import { ref } from 'vue'
import { BaseTheme, type BaseThemeOptions, type Brightness, type ThemeMode } from './base-theme.js'
import type { AnyColor, ColorTag } from '../types.js'

/**
 * uni-app主题管理类
 *
 * @description 专为uni-app环境设计的主题管理类，依赖uni-app提供的API
 * 依赖{@link https://uniapp.dcloud.net.cn/api/system/theme.html#onthemechange uni.onThemeChange}
 * 不能通过CSS变量获取颜色角色，只能通过 `role` 和 `tonal` 方法来获取颜色，主题模式变化时会自动更新视图
 *
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
 * @extends BaseTheme<OutColorTag, CustomKeys>
 *
 * @example
 * ```ts
 * import { createUniTheme } from '@vi-design/color'
 *
 * const theme = createUniTheme('#1677ff')
 * // 通常我们会将主题挂载到 uni 上，方便全局调用
 * uni.$theme = theme // 注意ts类型校验
 *
 * // 在模板中使用
 * <view :style="{
 *      backgroundColor: uni.$theme.role('primary-container'),
 *      color: uni.$theme.role('on-primary-container')
 *    }">
 *   主题色
 * </view>
 * ```
 */
export class UniAppTheme<OutColorTag extends ColorTag, CustomKeys extends string> extends BaseTheme<
  OutColorTag,
  CustomKeys
> {
  /**
   * UniAppTheme构造函数
   *
   * @description 创建一个uni-app主题管理实例，初始化主题模式和颜色方案，并监听系统主题变化
   * @constructor
   * @inheritDoc
   * @param {AnyColor} mainColor - 主色，作为整个配色方案的基础
   * @param {BaseThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项，用于自定义主题行为
   */
  constructor(mainColor: AnyColor, options: BaseThemeOptions<OutColorTag, CustomKeys> = {}) {
    options.refFactory ??= ref
    super(mainColor, options)
    uni.onThemeChange(({ theme }) => {
      // 如果是system模式，则切换主题
      if (this.mode === 'system') this.setMode(theme as Brightness)
    })
  }

  /**
   * 缓存主题模式
   *
   * @description 将当前主题模式保存到uni-app的Storage中
   * @inheritDoc
   * @override
   * @param {ThemeMode} mode - 要缓存的主题模式
   * @returns {void}
   */
  protected override setCacheThemeMode(mode: ThemeMode): void {
    uni.setStorageSync(this.cacheKey, mode)
  }

  /**
   * 清除缓存
   *
   * @description 清除uni-app的Storage中的主题模式缓存
   * @inheritDoc
   * @override
   * @returns {void}
   */
  override clearCache(): void {
    uni.removeStorageSync(this.cacheKey)
  }

  /**
   * 获取缓存的主题模式
   *
   * @description 从uni-app的Storage中获取之前缓存的主题模式
   * @inheritDoc
   * @override
   * @returns {ThemeMode | undefined | null} 缓存的主题模式
   */
  override getCacheThemeMode() {
    return uni.getStorageSync(this.cacheKey)
  }

  /**
   * 获取系统亮度
   *
   * @description 获取当前uni-app环境下系统的亮度模式设置
   * @inheritDoc
   * @override
   * @returns {Brightness} 系统的亮度模式，如果获取失败则返回'light'
   */
  override get systemBright(): Brightness {
    return (uni.getSystemInfoSync().theme as Brightness) || 'light'
  }
}

/**
 * 创建UniApp主题实例
 *
 * @description 创建一个uni-app环境下的主题管理实例，仅支持vue3模式，兼容微信小程序和App
 *
 * @template OutColorTag - 输出的颜色标签类型
 * @template CustomKeys - 自定义颜色键类型
 * @param {AnyColor} mainColor - 主色，作为整个配色方案的基础
 * @param {BaseThemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项
 * @param {Record<CustomKeys, AnyColor>} [options.customColor] - 自定义基准配色
 * @param {string} [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param {RefFactory} [options.refFactory] - 自定义ref函数，默认使用Vue的ref
 * @param {ComputeFormula} [options.formula=triadic] - 配色方案算法
 * @param {number} [options.angle] - 色相偏移角度
 * @returns {UniAppTheme<OutColorTag, CustomKeys>} 主题实例
 */
export function createUniTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  mainColor: AnyColor,
  options?: BaseThemeOptions<OutColorTag, CustomKeys>
): UniAppTheme<OutColorTag, CustomKeys> {
  return new UniAppTheme(mainColor, options as BaseThemeOptions<OutColorTag, CustomKeys>)
}
