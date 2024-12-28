import { Palette } from './palette/index.js'

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
 */
export type HSLObject = { h: number; s: number; l: number }

/**
 * 小写代表字符串颜色类型，大写代表颜色对象类型
 */
export type ColorTag = 'hex' | 'rgb' | 'hsl' | 'RGB' | 'HSL'

/**
 * 颜色类型转换
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
 * 基准配色方案
 *
 * 如有自定义配色方案，重写该接口，添加配色方案。
 */
export type ColorScheme<T extends AnyColor = AnyColor> = Record<ColorSchemeKeys, T>

/**
 * 配色方案调色板
 */
export type ColorSchemePalettes<T extends AnyColor = AnyColor> = Record<ColorSchemeKeys, Palette<T>>

/**
 * 调色板提取颜色规则
 */
export type PaletteExtractionColorRules = {
  /**
   * 源色容器颜色
   */
  container: number
  /**
   * 源色容器之上的文本颜色
   */
  onContainer: number
  /**
   * 源色
   */
  source: number
  /**
   * 源色之上的文本颜色
   */
  onSource: number
}

/**
 * 配色方案键
 */
export type ColorSchemeKeys =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'warning'
  | 'danger'
  | 'neutral'

type RoleKeys = Exclude<ColorSchemeKeys, 'neutral'>
/**
 * 配色方案对应的颜色角色
 *
 * 借鉴于{@link https://material.io/design/color/the-color-system.html#color-roles Material Design}。
 *
 * `neutral` 调色板转化的角色较多，单独处理，具体见 {@link NeutralColorRoles} 接口
 */
export type ColorSchemeRoles<T extends AnyColor = AnyColor> = {
  [K in Exclude<RoleKeys, 'neutral'>]: T
} & {
  [K in `on${Capitalize<RoleKeys>}`]: T
} & {
  [K in `${RoleKeys}Container`]: T
} & {
  [K in `on${Capitalize<RoleKeys>}Container`]: T
} & NeutralColorRoles<T>

/**
 * 中性调色板生成的角色
 */
export interface NeutralColorRoles<T extends AnyColor = AnyColor> {
  /**
   * 默认的背景颜色
   */
  surface: T

  /**
   * 反色表面容器颜色
   */
  inverseSurface: T

  /**
   * 反色表面容器颜色之上的文本颜色
   */
  inverseOnSurface: T

  /**
   * 表面最暗淡的颜色
   */
  surfaceDim: T

  /**
   * 最亮表面颜色
   */
  surfaceBright: T

  /**
   * 表面容器最低层的颜色
   */
  surfaceContainerLowest: T

  /**
   * 表面容器颜色
   */
  surfaceContainer: T

  /**
   * 低强调容器颜色
   */
  surfaceContainerLow: T

  /**
   * 高强调容器颜色
   */
  surfaceContainerHigh: T

  /**
   * 最高强调容器颜色
   */
  surfaceContainerHighest: T

  /**
   * 背景之上的文本颜色
   */
  onSurface: T

  /**
   * 背景之上的文本颜色，低强调浅灰色
   */
  onSurfaceVariant: T

  /**
   * 通常用于描边，中性色
   */
  outline: T

  /**
   * 通常用于分割线，偏向于灰色
   */
  outlineVariant: T

  /**
   * 阴影颜色，通常需要降低透明度使用
   */
  shadow: T
}

/**
 * 主题配色
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
