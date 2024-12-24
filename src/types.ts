/**
 * 16进制颜色类型
 */
export type HexColor = `#${string}`

/**
 * rgba颜色类型
 */
export type RgbaColor = `rgba(${number}, ${number}, ${number}, ${number})`

/**
 * rgb颜色类型
 */
export type RgbColor = `rgb(${number}, ${number}, ${number})`

/**
 * RGB颜色对象类型
 */
export interface RGBColor {
  r: number
  g: number
  b: number
}

/**
 * RGBA颜色对象类型
 */
export interface RGBAColor extends RGBColor {
  a: number
}

/**
 * HSL颜色对象类型
 */
export type HSLColor = { h: number; s: number; l: number }

/**
 * 小写代表字符串颜色类型，大写代表颜色对象类型
 */
export type OutType = 'hex' | 'rgb' | 'RGB'
export type Out<T extends OutType> = T extends 'hex'
  ? HexColor
  : T extends 'rgb'
    ? RgbColor
    : RGBColor
