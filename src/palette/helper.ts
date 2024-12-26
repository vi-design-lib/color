// noinspection JSUnusedGlobalSymbols

import { anyColorToRgbObject, anyColorToTargetColor, getColorType } from '../utils/index.js'
import { Palette } from './palette.js'
import type { AnyColor, ColorTag, ColorTagToColorType, RGBObject } from '../types.js'

/**
 * 获取基于 RGB 模型的调色板颜色
 *
 * @template T - 输出颜色的类型标记
 * @param {number} i - 色阶索引，必须小于色阶数量
 * @param {RGBObject} sourceColor - 源色
 * @param {number} steps - 色阶数量，建议单数，颜色过渡更平滑(中间值则是源色)
 * @param {ColorTag} type - 输出颜色类型
 * @returns {T} - 调色板颜色
 */
export function getPaletteColor<T extends ColorTag>(
  i: number,
  sourceColor: AnyColor,
  steps: number,
  type: T
): ColorTagToColorType<T>
/**
 * 获取基于 RGB 模型的调色板颜色
 *
 * @template T - 颜色类型
 * @param {number} i - 色阶索引，必须小于色阶数量
 * @param {T} sourceColor - 源色
 * @param {number} steps - 色阶数量，建议单数，颜色过渡更平滑(中间值则是源色)
 * @returns {T} - 调色板颜色，和源色类型一致
 */
export function getPaletteColor<T extends ColorTag>(
  i: number,
  sourceColor: AnyColor,
  steps: number
): ColorTagToColorType<T>
export function getPaletteColor<T extends AnyColor>(
  i: number,
  sourceColor: T,
  steps: number,
  type?: ColorTag
): T {
  if (i > steps) throw new Error('i must be less than steps')
  type = type ?? getColorType(sourceColor)
  const { r, g, b } = anyColorToRgbObject(sourceColor)
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
  const newRgb: RGBObject = { r: newR, g: newG, b: newB }
  return anyColorToTargetColor(newRgb, type, 'RGB') as T
}

/**
 * 生成调色板
 *
 * 建议：
 * 1. 只是获取某个色阶的颜色，请使用 `getPaletteColor` 函数。
 * 2. `new Palette(sourceColor, steps)` 实例化{@link Palette}对象，然后使用 Palette 对象提供的方法来获取颜色性能更佳。
 *
 * @template T - 颜色类型
 * @param {T} sourceColor - 源颜色
 * @param {number} steps - 色阶的数量
 * @returns {Array<T>} - 调色板颜色数组(黑->源->白)
 */
export function makePalette<T extends AnyColor>(sourceColor: T, steps: number = 11): Array<T> {
  const palette: Array<T> = []
  const type = getColorType(sourceColor)
  const source = anyColorToRgbObject(sourceColor, type)
  for (let i = 0; i < steps; i++) {
    palette.push(getPaletteColor(i, source, steps, type) as T)
  }
  return palette
}
