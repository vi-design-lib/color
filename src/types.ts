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
 * rgba颜色类型
 */
export type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number})`

/**
 * rgb颜色类型
 */
export type RgbColor = `rgb(${number}, ${number}, ${number})`

/**
 * 字符串颜色类型
 */
export type StrColors = HexColor | HslColor | RgbColor | string

/**
 * RGB颜色对象类型
 */
export interface RGBObject {
  r: number
  g: number
  b: number
}

/**
 * RGBA颜色对象类型
 */
export interface RGBAObject extends RGBObject {
  a: number
}

/**
 * HSL颜色对象类型
 */
export type HSLObject = { h: number; s: number; l: number }

/**
 * 小写代表字符串颜色类型，大写代表颜色对象类型
 */
export type OutType = 'hex' | 'rgb' | 'RGB' | 'HSL'
export type Out<T extends OutType> = T extends 'hex'
  ? HexColor
  : T extends 'rgb'
    ? RgbColor
    : T extends 'RGB'
      ? RGBObject
      : HSLObject

/**
 * 基准配色方案
 */
export interface BaseColorScheme<T> {
  /**
   * 主色
   */
  primary: T
  /**
   * 次要辅色
   *
   * 主色相邻的颜色，通过调整饱和度和亮度来形成对比度
   */
  secondary: T
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
}

/**
 * 配色方案
 */
export type ColorSchemePalette<T extends RgbColor | HexColor> = BaseColorScheme<Palette<T>>
