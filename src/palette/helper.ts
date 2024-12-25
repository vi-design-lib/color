// noinspection JSUnusedGlobalSymbols

import { colorToRgbObj, hslToRgb, rgbToHex, rgbToHsl, rgbToString } from '../utils/index.js'
import { Palette } from './palette.js'
import type { HexColor, Out, OutType, RgbColor, RGBColor } from '../types.js'

/**
 * 获取基于 HSL 模型的调色板颜色
 *
 * @param {number} i - 色阶索引，必须小于色阶数量
 * @param {RGBColor} sourceColor - 源色
 * @param {number} steps - 色阶数量，建议单数，颜色过渡更平滑(中间值则是源色)
 * @param {'hex' | 'rgb' | 'hsl'} type - 返回的颜色类型，默认为 HEX
 * @returns {HexColor | RgbColor | RGBColor} - 调色板颜色
 */
export function getPaletteColor<OUT extends OutType = 'hex'>(
  i: number,
  sourceColor: RGBColor,
  steps: number,
  type: OUT = 'hex' as OUT
): Out<OUT> {
  if (i > steps) throw new Error('i must be less than steps')

  // 将源色转换为 HSL
  const { h, s, l } = rgbToHsl(sourceColor)
  let newH = h
  let newS = s
  let newL

  const halfSteps = Math.floor(steps / 2)

  if (i < halfSteps) {
    // 从黑色到源色的过渡
    const factor = i / halfSteps
    newL = Math.round(factor * 100) // 从黑色到源色的亮度过渡
  } else {
    // 从源色到白色的过渡
    const reverseIndex = i - halfSteps
    const factor = reverseIndex / halfSteps
    newL = Math.round((1 - factor) * l + factor * 100) // 从源色到白色的亮度过渡
  }

  const newHsl = { h: newH, s: newS, l: newL }

  // 将 HSL 转回 RGB 并返回
  const newRgb = hslToRgb(newHsl)

  if (type === 'rgb') return newRgb as Out<OUT>
  return (type === 'rgb' ? rgbToString(newRgb) : rgbToHex(newRgb)) as Out<OUT>
}
/**
 * 生成调色板
 *
 * 建议：
 * 1. 只是获取某个色阶的颜色，请使用 `getPaletteColor` 函数。
 * 2. `new Palette(sourceColor, steps)` 实例化{@link Palette}对象，然后使用 Palette 对象提供的方法来获取颜色性能更佳。
 *
 * @param {RgbColor|HexColor|RGBColor} sourceColor - 源颜色
 * @param {number} steps - 色阶的数量
 * @param {'hex' | 'rgb'} [type=hex] - 返回的颜色类型，默认为 HEX
 * @returns {Array<HexColor | RgbColor | RGBColor>} - 调色板颜色数组(黑->源->白)
 */
export function makePalette<OUT extends OutType = 'hex'>(
  sourceColor: RgbColor | HexColor | RGBColor,
  steps: number = 11,
  type: OutType = 'hex'
): Array<Out<OUT>> {
  if (typeof sourceColor === 'string') {
    sourceColor = colorToRgbObj(sourceColor)
  }
  const palette: Array<Out<OUT>> = []
  for (let i = 0; i < steps; i++) {
    palette.push(getPaletteColor(i, sourceColor, steps, type) as Out<OUT>)
  }
  return palette as Array<Out<OUT>>
}
