import { anyColorToHslObject, anyColorToTargetColor, getColorType } from '../utils/index.js'
import { Palette } from './palette.js'
import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'

/**
 * 获取调色板颜色
 *
 * @template T - 输出颜色的类型标记
 * @param {number} i - 色阶索引，0~${size-1}
 * @param {RGBObject} sourceColor - 源色
 * @param {number} size - 色阶数量
 * @param {ColorTag} type - 输出颜色类型
 * @returns {T} - 调色板颜色
 */
export function getPaletteColor<T extends ColorTag>(
  i: number,
  sourceColor: AnyColor,
  size: number,
  type: T
): ColorTagToColorType<T>
/**
 * 获取调色板颜色
 *
 * @template T - 颜色类型
 * @param {number} i - 色阶索引，0~${size-1}
 * @param {T} sourceColor - 源色
 * @param {number} size - 色阶数量
 * @returns {T} - 调色板颜色，和源色类型一致
 */
export function getPaletteColor<T extends ColorTag>(
  i: number,
  sourceColor: AnyColor,
  size: number
): ColorTagToColorType<T>
export function getPaletteColor<T extends AnyColor>(
  i: number,
  sourceColor: T,
  size: number,
  type?: ColorTag
): T {
  if (i >= size) i = size - 1
  type = type ?? getColorType(sourceColor)

  const { h, s } = anyColorToHslObject(sourceColor)
  let newL: number
  const factor = i / (size - 1)
  newL = Math.round(factor * 100) / 100 // 亮度从 0 到 1 均匀变化
  return anyColorToTargetColor({ h, s, l: newL }, type, 'HSL') as T
}

/**
 * 生成调色板
 *
 * 建议：
 * 1. 只获取某个色阶的颜色，请使用 {@link getPaletteColor} 函数。
 * 2. `new Palette(sourceColor, size)` 实例化{@link Palette}对象，然后使用 `Palette` 对象提供的方法来获取颜色性能更佳。
 *
 * @template T - 颜色类型
 * @param {T} sourceColor - 源颜色
 * @param {number} size - 色阶的数量
 * @returns {Array<T>} - 调色板色阶数组(黑->源->白)，色阶总数为奇数时最中间的色阶为源色
 */
export function makePaletteArray<T extends AnyColor>(sourceColor: T, size: number): Array<T> {
  const palette: Array<T> = []
  const type = getColorType(sourceColor)
  const source = anyColorToHslObject(sourceColor, type)
  for (let i = 0; i < size; i++) {
    palette.push(getPaletteColor(i, source, size, type) as T)
  }
  return palette
}
