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
export type OutType = 'hex' | 'rgb' | 'RGB'
export type Out<T extends OutType> = T extends 'hex'
  ? HexColor
  : T extends 'rgb'
    ? RgbColor
    : RGBObject
