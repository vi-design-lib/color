// @ts-ignore
import { ref } from 'vue'
import { BaseTheme, type BaseThemeOptions, type Brightness, type ThemeMode } from './base-theme.js'
import type { AnyColor, ColorTag } from '../types.js'

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
 *      backgroundColor: uni.$them.role('main-container'),
 *      color: uni.$them.tonal('on-main-container')
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
   * @inheritDoc
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
   * @inheritDoc
   */
  protected override setCacheThemeMode(mode: ThemeMode): void {
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
 * @param { AnyColor } mainColor - 主色
 * @param { BaseThemeOptions } [options] - 可选配置选项
 * @param { Object } options.customColorScheme - 自定义基准配色
 * @param { string } [options.cacheKey=_CACHE_THEME_MODE] - 自定义缓存名称
 * @param { ComputeFormula } [options.formula=triadic] - 配色方案算法
 * @param { number } [options.angle] - 色相偏移角度
 * @returns {UniAppTheme} - 主题实例
 */
export function createUniTheme<OutColorTag extends ColorTag, CustomKeys extends string>(
  mainColor: AnyColor,
  options?: BaseThemeOptions<OutColorTag, CustomKeys>
): UniAppTheme<OutColorTag, CustomKeys> {
  return new UniAppTheme(mainColor, options as BaseThemeOptions<OutColorTag, CustomKeys>)
}
