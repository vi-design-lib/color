// @ts-ignore
import { ref } from 'vue'
import { BaseTheme, type BaseThemeOptions, type Brightness, type ThemeMode } from './base-theme.js'
import type { AnyColor, HexColor } from '../types.js'

export type UniAppThemeOptions<T extends AnyColor, CustomKeys extends string> = Omit<
  BaseThemeOptions<T, CustomKeys>,
  'refFactory'
>

/**
 * uni-app主题
 *
 * 依赖{@link https://uniapp.dcloud.net.cn/api/system/theme.html#onthemechange uni.onThemeChange}
 *
 * 不能通过 css var 颜色角色，只能通过 `role` 和 `tonal` 方法来获取颜色，主题模式变化时会自动更新视图
 *
 * @example
 * ```ts
 * import { createUniTheme } from '@vi-design/color'
 *
 * const theme = createUniTheme('#1677ff')
 * // 通常我们会将主题挂载到 uni 上，方便全局调用
 * uni.$theme = theme // 注意ts类型校验
 *
 * template:
 *
 * <view :style="{
 *      backgroundColor: uni.$them.role('primary-container'),
 *      color: uni.$them.tonal('on-primary-container')
 *    }">
 *   主题色
 * </view>
 * ```
 */
export class UniAppTheme<
  T extends AnyColor = HexColor,
  CustomKeys extends string = never
> extends BaseTheme<T, CustomKeys> {
  /**
   * 单例
   */
  static readonly instance: UniAppTheme | undefined
  /**
   * @inheritDoc
   */
  constructor(primary: T, options: UniAppThemeOptions<T, CustomKeys> = {}) {
    // @ts-ignore
    options.refProxy = ref
    super(primary, options)
    uni.onThemeChange(({ theme }) => {
      // 如果是system模式，则切换主题
      if (this.mode === 'system') this.setMode(theme as Brightness)
    })
  }

  /**
   * @inheritDoc
   */
  protected override cacheThemeMode(mode: ThemeMode): void {
    uni.setStorageSync(this.cacheKey, mode)
  }

  /**
   * @inheritDoc
   */
  override clearCache(): void {
    uni.removeStorageSync(this.cacheKey)
  }

  /**
   * @inheritDoc
   */
  override getCacheThemeMode() {
    return uni.getStorageSync(this.cacheKey)
  }

  /**
   * @inheritDoc
   */
  override get systemBright(): Brightness {
    return (uni.getSystemInfoSync().theme as Brightness) || 'light'
  }
}

/**
 * 创建UniAPP主题实例
 *
 * 仅支持 vue3 模式，兼容微信小程序 和 App vue
 *
 * @param { AnyColor } primary - 主色
 * @param { UniAppThemeOptions } [options] - 选项
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {UniAppTheme} - 主题实例
 */
export function createUniTheme<T extends AnyColor, CustomKeys extends string>(
  primary: T,
  options?: UniAppThemeOptions<T, CustomKeys>
): UniAppTheme<T, CustomKeys> {
  return new UniAppTheme(primary, options as UniAppThemeOptions<T, CustomKeys>)
}
