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

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Record<string | symbol, any> ? DeepPartial<T[P]> : T[P]
}
