import {
  colorToRgbObj,
  type HEXColor,
  type RgbColor,
  type RgbColorObj,
  rgbToHex,
  rgbToString
} from '../utils/index.js'
import { Palette, type PaletteOptions } from './palette.js'

/**
 * 获取调色板颜色
 *
 * @param {number} i - 色阶索引，必须小于色阶数量
 * @param {RgbColorObj} sourceColor - 源色
 * @param {number} steps - 色阶数量，建议单数，颜色过渡更平滑(中间值则是源色)
 * @param {'hex' | 'rgb'} type - 返回的颜色类型，默认为 HEX
 * @returns {string} - 调色板颜色
 */
export function getPaletteColor(
  i: number,
  sourceColor: RgbColorObj,
  steps: number,
  type: 'hex' | 'rgb' = 'hex'
): string {
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
  const newRgb: RgbColorObj = { r: newR, g: newG, b: newB }
  return type === 'rgb' ? rgbToString(newRgb) : rgbToHex(newRgb)
}

/**
 * 生成调色板
 *
 * 建议：
 * 1. 只是获取某个色阶的颜色，请使用 `getPaletteColor` 函数。
 * 2. `new Palette(sourceColor, steps)` 实例化{@link Palette}对象，然后使用 Palette 对象提供的方法来获取颜色性能更佳。
 *
 * @param {RgbColorObj} sourceColor - 传入的原始颜色
 * @param {number} steps - 色阶的数量
 * @param {'hex' | 'rgb'} [type=hex] - 返回的颜色类型，默认为 HEX
 * @returns {string[]} - 调色板颜色数组(黑->源->白)
 */
export function makePaletteFromRgb(
  sourceColor: RgbColorObj,
  steps: number = 11,
  type: 'hex' | 'rgb' = 'hex'
): string[] {
  const palette: string[] = []
  for (let i = 0; i < steps; i++) {
    palette.push(getPaletteColor(i, sourceColor, steps, type))
  }
  return palette
}

/**
 * 创建调色板
 *
 * @param {RgbColor | HEXColor} sourceColor - 源色
 * @param {number} [steps=11] - 色阶数量
 * @param {'hex' | 'rgb'} [type=hex] - 返回的颜色类型，默认为 hex
 * @returns {string[]} - 调色板颜色数组(黑->源->白)
 */
export function makePalette(
  sourceColor: RgbColor | HEXColor,
  steps: number = 11,
  type: 'hex' | 'rgb' = 'hex'
): string[] {
  return makePaletteFromRgb(colorToRgbObj(sourceColor), steps, type)
}
