import {
  BaseTheme,
  type BaseThemeOptions,
  type Brightness,
  type RefFn,
  type ThemeMode
} from './base-theme.js'
import type { AnyColor, HexColor } from '../types.js'

export interface UniAppThemeOptions<T extends AnyColor, CustomKeys extends string>
  extends BaseThemeOptions<T, CustomKeys> {
  refProxy: RefFn
}
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
   * @inheritDoc
   */
  constructor(primary: T, options?: BaseThemeOptions<T, CustomKeys>) {
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
  override getCacheThemeMode(): ThemeMode {
    return uni.getStorageSync(this.cacheKey) || 'system'
  }

  /**
   * @inheritDoc
   */
  override get systemBright(): Brightness {
    return (uni.getSystemInfoSync().theme as Brightness) || 'light'
  }
}
