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
export type StringColors = HexColor | HslColor | RgbColor | string

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
 */
export interface ColorScheme<T extends AnyColor = AnyColor> {
  /**
   * 主色
   */
  primary: T
  /**
   * 次要辅色
   *
   * 主色相邻的颜色，通过调整饱和度和亮度来形成对比度
   */
  minor: T
  /**
   * 三级辅色
   *
   * 主色相邻的颜色，通过调整饱和度和亮度来形成对比度
   */
  tertiary: T
  /**
   * 警告色
   *
   * 默认是主色的互补色，形成强烈的对比度
   */
  warning: T
  /**
   * 危险色
   *
   * 默认是红色，根据主色调整了饱和度和亮度
   */
  danger: T
  /**
   * 中性色
   *
   * 根据主色计算出来的中性色，它接近于灰色，但它和主色之间存在一定的色相关联
   */
  neutral: T
  /**
   * 自定义配色方案
   */
  [key: string]: T
}

export type ColorSchemePalettes<T extends ColorScheme> = Record<keyof T, Palette<T['primary']>>
