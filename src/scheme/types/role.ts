import type { InherentColorKeys } from '../types.js'
import type { AnyColor, ColorTag, ColorTagToColorType } from '../../types.js'

/**
 * 中性调色板生成的角色
 */
export interface NeutralColorRoles<T> {
  /**
   * 背景色，与 `surface` 的颜色相同
   */
  background: T

  /**
   * 前景色，与 `onSurface` 的颜色相同。
   */

  onBackground: T

  /**
   * 表面颜色，通常用于页面的默认背景颜色。
   */
  surface: T

  /**
   * 表面变暗的颜色，通常用于页面的默认背景颜色。
   */
  surfaceVariant: T

  /**
   * 针对任何表面颜色的文本和图标，通常做为页面的默认文本颜色。
   */
  onSurface: T

  /**
   * 在表面背景之上的文本和图标的低强调颜色
   */
  onSurfaceVariant: T

  /**
   * `surface`的反向互补色
   */
  inverseSurface: T

  /**
   * 反色表面容器颜色之上的文本颜色
   */
  inverseOnSurface: T

  /**
   * 表面最暗淡的颜色
   *
   * 在light模式下它会比其他表面颜色更暗淡，
   * 在dark模式下它和`surface`的颜色相同。
   */
  surfaceDim: T

  /**
   * 最明亮表面颜色
   */
  surfaceBright: T

  /**
   * 最低强调的容器颜色
   */
  surfaceContainerLowest: T

  /**
   * 默认的容器颜色
   *
   * 通常用于页面之上的第一层大面积容器的背景颜色
   *
   * 例如：导航栏，菜单栏，侧边栏
   */
  surfaceContainer: T

  /**
   * 低强调的表面容器颜色
   */
  surfaceContainerLow: T

  /**
   * 高强调的表面容器颜色
   */
  surfaceContainerHigh: T

  /**
   * 最高强调的表面容器颜色
   */
  surfaceContainerHighest: T

  /**
   * 带有强调性的中性色，通常用于轮廓描边。
   */
  outline: T

  /**
   * 低强调性的中性色，通常用于分割线。
   */
  outlineVariant: T

  /**
   * 阴影颜色，通常需要降低透明度使用。
   */
  shadow: T

  /**
   * 遮罩颜色，通常需要降低透明度使用。
   */
  scrim: T
}

/**
 * 配色方案转换为角色
 */
type ExpandColorRoles<KS extends string, ColorType extends AnyColor> = {
  [K in KS]: ColorType
} & {
  [K in `on${Capitalize<KS>}`]: ColorType
} & {
  [K in `${KS}Container`]: ColorType
} & {
  [K in `on${Capitalize<KS>}Container`]: ColorType
}

/**
 * 配色方案对应的颜色角色
 */
export type ColorSchemeRoles<
  CustomKeys extends string,
  OutColorTag extends ColorTag
> = ExpandColorRoles<
  CustomKeys | Exclude<InherentColorKeys, 'neutral'>,
  ColorTagToColorType<OutColorTag>
> &
  NeutralColorRoles<ColorTagToColorType<OutColorTag>>
