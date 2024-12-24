// noinspection JSUnusedGlobalSymbols

import { colorToRgbObj, rgbToHex, rgbToString } from '../utils/index.js'
import { Palette } from './palette.js'
import type { HexColor, Out, OutType, RgbColor, RGBColor } from '../types.js'

/**
 * 获取调色板颜色
 *
 * @param {number} i - 色阶索引，必须小于色阶数量
 * @param {RGBColor} sourceColor - 源色
 * @param {number} steps - 色阶数量，建议单数，颜色过渡更平滑(中间值则是源色)
 * @param {'hex' | 'rgb'} type - 返回的颜色类型，默认为 HEX
 * @returns {HexColor | RgbColor | RGBColor} - 调色板颜色
 */
export function getPaletteColor<OUT extends OutType = 'hex'>(
  i: number,
  sourceColor: RGBColor,
  steps: number,
  type: OUT = 'hex' as OUT
): Out<OUT> {
  if (i > steps) throw new Error('i must be less than steps')
  const { r, g, b } = sourceColor
  let newR, newG, newB
  const halfSteps = Math.floor(steps / 2)
  if (i < halfSteps) {
    // 从黑色到源色的过渡
    const factor = i / halfSteps
    // 使黑色到源色的渐变更加平滑
    newR = Math.round(r * factor)
    newG = Math.round(g * factor)
    newB = Math.round(b * factor)
  } else {
    // 从源色到白色的过渡
    const reverseIndex = i - halfSteps // 从源色到白色的部分
    const factor = reverseIndex / halfSteps
    newR = Math.round(r * (1 - factor) + 255 * factor)
    newG = Math.round(g * (1 - factor) + 255 * factor)
    newB = Math.round(b * (1 - factor) + 255 * factor)
  }
  const newRgb: RGBColor = { r: newR, g: newG, b: newB }
  if (type === 'RGB') return newRgb as Out<OUT>
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
