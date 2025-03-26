import type { AnyColor, ColorTag, ColorTagToColorType } from '../../types.js'
import type { InherentColorKeys } from './scheme.js'

/**
 * 中性调色板生成的角色
 *
 * 定义了基于中性色调生成的一系列UI角色颜色，用于构建一致的界面层次结构。
 *
 * @template T - 颜色值类型
 */
export interface NeutralColorRoles<T> {
  /**
   * 背景色
   *
   * 与 `surface` 的颜色相同，用作页面的基础背景色。
   */
  background: T

  /**
   * 前景色
   *
   * 与 `onSurface` 的颜色相同，用于背景上的内容显示。
   */

  onBackground: T

  /**
   * 表面颜色
   *
   * 通常用于页面的默认背景颜色，是UI界面的基础层。
   */
  surface: T

  /**
   * 表面变体颜色
   *
   * 表面颜色的变体，通常用于区分不同层级的表面元素。
   */
  surfaceVariant: T

  /**
   * 表面上的内容颜色
   *
   * 针对任何表面颜色的文本和图标，通常作为页面的默认文本颜色。
   */
  onSurface: T

  /**
   * 表面变体上的内容颜色
   *
   * 在表面变体背景之上的文本和图标的低强调颜色，用于次要信息显示。
   */
  onSurfaceVariant: T

  /**
   * 反色表面
   *
   * `surface`的反向互补色，用于创建对比鲜明的UI元素。
   */
  inverseSurface: T

  /**
   * 反色表面上的内容颜色
   *
   * 反色表面容器颜色之上的文本和图标颜色，确保在反色背景上的可读性。
   */
  inverseOnSurface: T

  /**
   * 表面最暗淡的颜色
   *
   * 在light模式下它会比其他表面颜色更暗淡，
   * 在dark模式下它和`surface`的颜色相同。
   *
   * 用于创建低调的背景区域。
   */
  surfaceDim: T

  /**
   * 最明亮表面颜色
   *
   * 表面系列中亮度最高的颜色，用于强调和突出显示的区域。
   */
  surfaceBright: T

  /**
   * 最低强调的容器颜色
   *
   * 容器系列中强调程度最低的颜色，用于最底层的容器背景。
   */
  surfaceContainerLowest: T

  /**
   * 默认的容器颜色
   *
   * 通常用于页面之上的第一层大面积容器的背景颜色。
   *
   * 例如：导航栏，菜单栏，侧边栏等UI组件。
   */
  surfaceContainer: T

  /**
   * 低强调的表面容器颜色
   *
   * 容器系列中强调程度较低的颜色，用于次要容器的背景。
   */
  surfaceContainerLow: T

  /**
   * 高强调的表面容器颜色
   *
   * 容器系列中强调程度较高的颜色，用于需要更多注意力的容器背景。
   */
  surfaceContainerHigh: T

  /**
   * 最高强调的表面容器颜色
   *
   * 容器系列中强调程度最高的颜色，用于最需要用户关注的容器背景。
   */
  surfaceContainerHighest: T

  /**
   * 轮廓颜色
   *
   * 带有强调性的中性色，通常用于元素的轮廓描边，提供边界和分隔。
   */
  outline: T

  /**
   * 轮廓变体颜色
   *
   * 低强调性的中性色，通常用于分割线和次要边界。
   */
  outlineVariant: T

  /**
   * 阴影颜色
   *
   * 用于创建阴影效果的颜色，通常需要降低透明度使用，增强UI的层次感。
   */
  shadow: T

  /**
   * 遮罩颜色
   *
   * 用于创建遮罩层的颜色，通常需要降低透明度使用，用于模态对话框背景等场景。
   */
  scrim: T
}

/**
 * 配色方案转换为角色
 *
 * 将基础颜色扩展为一系列相关的UI角色颜色，包括基础色、悬停色、激活色等状态变体。
 *
 * @template KS - 颜色键类型，表示基础颜色的名称
 * @template ColorType - 颜色值类型
 */
type ExpandColorRoles<KS extends string, ColorType extends AnyColor> = {
  [K in KS]: ColorType
} & {
  [K in `on${Capitalize<KS>}`]: ColorType
} & {
  [K in `${KS}Hover`]: ColorType
} & {
  [K in `${KS}Active`]: ColorType
} & {
  [K in `${KS}Disabled`]: ColorType
} & {
  [K in `${KS}Container`]: ColorType
} & {
  [K in `on${Capitalize<KS>}Container`]: ColorType
}

/**
 * 配色方案对应的颜色角色
 *
 * 将自定义颜色和固有颜色扩展为完整的UI角色颜色系统，包括中性色角色。
 *
 * @template CustomKeys - 自定义颜色键类型
 * @template OutColorTag - 输出颜色标签类型
 */
export type ColorSchemeRoles<
  CustomKeys extends string,
  OutColorTag extends ColorTag
> = ExpandColorRoles<
  Exclude<CustomKeys, 'neutral'> | Exclude<InherentColorKeys, 'neutral'>,
  ColorTagToColorType<OutColorTag>
> &
  NeutralColorRoles<ColorTagToColorType<OutColorTag>>
