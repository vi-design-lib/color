import type { Palette } from './palette/index.js'

/**
 * 16进制颜色类型
 */
export type HexColor = `#${string}`

/**
 * hsl颜色类型
 */
export type HslColor = `hsl(${number}, ${number}%, ${number}%)`

/**
 * rgb颜色类型
 */
export type RgbColor = `rgb(${number}, ${number}, ${number})`

/**
 * 字符串颜色类型
 */
export type StringColors = HexColor | HslColor | RgbColor

/**
 * 颜色对象类型
 */
export type ObjectColors = RGBObject | HSLObject

/**
 * 任意颜色类型
 */
export type AnyColor = StringColors | ObjectColors

/**
 * RGB颜色对象类型
 */
export interface RGBObject {
  r: number
  g: number
  b: number
}

/**
 * HSL颜色对象类型
 *
 * 注意：
 * - `h`: 色调，0-360
 * - `s`: 饱和度，0-1
 * - `l`: 亮度，0-1
 */
export type HSLObject = { h: number; s: number; l: number }

/**
 * 小写代表字符串颜色类型，大写代表颜色对象类型
 */
export type ColorTag = 'hex' | 'rgb' | 'hsl' | 'RGB' | 'HSL'

/**
 * 调色板可选
 */
export type PaletteOptions = {
  /**
   * 调色板最小亮度，默认为0
   *
   * @default 0
   */
  min?: number
  /**
   * 调色板最大亮度，默认为1
   *
   * @default 1
   */
  max?: number
  /**
   * 颜色类型
   *
   * 如果不传入则会根据源色类型自动识别
   */
  type?: ColorTag
}

/**
 * 颜色标签转颜色类型
 */
export type ColorTagToColorType<T extends ColorTag> = T extends 'hex'
  ? HexColor
  : T extends 'rgb'
    ? RgbColor
    : T extends 'hsl'
      ? HslColor
      : T extends 'RGB'
        ? RGBObject
        : T extends 'HSL'
          ? HSLObject
          : never

/**
 * 颜色值转换为颜色类型
 */
export type ColorToColorType<T> = T extends HexColor
  ? HexColor
  : T extends RgbColor
    ? RgbColor
    : T extends HSLObject
      ? HSLObject
      : T extends HslColor
        ? HslColor
        : T extends RGBObject
          ? RGBObject
          : T extends HSLObject
            ? HSLObject
            : never

/**
 * 配色方案调色板
 */
export type ColorSchemePalettes<T extends AnyColor = AnyColor> = Record<ColorSchemeKeys, Palette<T>>

/**
 * 调色板提取颜色规则
 */
export type PaletteExtractionColorRules = {
  // 主色的亮度和饱和度调整
  source: number
  // 悬停状态下的主色：增加亮度，稍微增强饱和度
  sourceHover: number
  // 激活状态下的主色：减少亮度，减少饱和度，模拟按下效果
  sourceActive: number
  // 禁用状态下的主色：大幅降低亮度和饱和度
  sourceDisabled: number
  // 主色背景上的文本颜色：白色
  onSource: number
  // 主色悬停状态上的文本颜色：增加对比度
  onSourceHover: number
  // 主色激活状态上的文本颜色：更深的文本颜色
  onSourceActive: number
  // 主色禁用状态上的文本颜色：灰色
  onSourceDisabled: number
  // 主色容器背景
  container: number
  // 容器上的文本颜色：深色
  onContainer: number
  /**
   * 中性色基准配色方案
   */
  base: BaseColorRoles<number>
}

/**
 * 基准配色方案
 */
export type ColorScheme<T extends AnyColor = AnyColor> = Record<ColorSchemeKeys, T>

/**
 * 配色方案键
 *
 * - `primary`: 主要颜色
 * - `aux`: 辅助颜色
 * - `minor`: 次要颜色
 * - `warning`: 警告颜色
 * - `error`: 危险颜色
 * - `neutral`: 中性颜色
 */
export type ColorSchemeKeys = 'primary' | 'aux' | 'minor' | 'warning' | 'error' | 'neutral'

/**
 * 简约色阶可选范围
 */
export type Tone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * 色调调色板
 */
export type Tonal<T extends AnyColor = AnyColor> = {
  [K in `${ColorSchemeKeys}-${Tone}`]: T
}

type RoleKeys = Exclude<ColorSchemeKeys, 'neutral'>

/**
 * 配色方案对应的颜色角色
 *
 * 借鉴于{@link https://material.io/design/color/the-color-system.html#color-roles Material Design}。
 *
 * `neutral` 调色板转化的角色较多，单独处理，具体见 {@link BaseColorRoles} 接口
 */
export type ColorSchemeRoles<T extends AnyColor> = {
  [K in RoleKeys]: T
} & {
  [K in `on${Capitalize<RoleKeys>}`]: T
} & {
  [K in `${RoleKeys}Container`]: T
} & {
  [K in `on${Capitalize<RoleKeys>}Container`]: T
} & BaseColorRoles<T>

/**
 * 中性调色板生成的角色
 */
export interface BaseColorRoles<T> {
  /**
   * 表面颜色，通常用于页面的默认背景颜色。
   */
  surface: T

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
   * 阴影颜色，非常暗淡的黑色，通常需要降低透明度使用。
   */
  shadow: T
}

/**
 * 配色方案
 */
export interface ThemeSchemes<T extends AnyColor = AnyColor> {
  /**
   * 亮色主题配色方案
   */
  light: ColorSchemeRoles<T>
  /**
   * 暗色主题配色方案
   */
  dark: ColorSchemeRoles<T>
}
