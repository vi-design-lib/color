import { anyColorToHslObject, anyColorToTargetColor } from '../utils/index.js'
import { Palette, type PaletteOptions } from './palette.js'
import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'

/**
 * 获取调色板颜色
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为hex
 * @param {number} i - 色阶索引，0~${size-1}
 * @param {AnyColor} sourceColor - 源色
 * @param {number} size - 色阶数量
 * @param {PaletteOptions<OutColorTag>} [options] - 调色板选项
 * @returns {ColorTagToColorType<OutColorTag>} - 调色板颜色，和源色类型一致
 */
export function getPaletteColor<OutColorTag extends ColorTag = 'hex'>(
  i: number,
  sourceColor: AnyColor,
  size: number,
  options?: PaletteOptions<OutColorTag>
): ColorTagToColorType<OutColorTag> {
  if (i >= size) i = size - 1

  const type: OutColorTag = options?.outType ?? ('hex' as OutColorTag)

  const { h, s } = anyColorToHslObject(sourceColor)

  // 调整亮度的范围，使最暗和最亮的颜色不会完全是黑白
  const minL = options?.min ?? 0 // 最暗亮度值
  const maxL = options?.max ?? 1 // 最亮亮度值

  const factor = i / (size - 1)

  // 通过插值计算亮度，并确保亮度在 minL 和 maxL 之间
  const l = minL + factor * (maxL - minL)

  return anyColorToTargetColor({ h, s, l }, type)
}

/**
 * 生成调色板
 *
 * 建议：
 * 1. 只获取某个色阶的颜色，请使用 {@link getPaletteColor} 函数。
 * 2. `new Palette(sourceColor, size)` 实例化{@linkcode Palette}对象，然后使用 `Palette` 对象提供的方法来获取颜色性能更佳。
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为hex
 * @param {AnyColor} sourceColor - 源颜色
 * @param {number} size - 色阶的数量
 * @param {PaletteOptions<OutColorTag>} [options] - 调色板选项
 * @returns {Array<ColorTagToColorType<OutColorTag>>} - 调色板色阶数组(黑->源->白)，色阶总数为奇数时最中间的色阶为源色
 */
export function makePaletteArray<OutColorTag extends ColorTag = 'hex'>(
  sourceColor: AnyColor,
  size: number,
  options?: PaletteOptions<OutColorTag>
): Array<ColorTagToColorType<OutColorTag>> {
  const palette: Array<ColorTagToColorType<OutColorTag>> = []
  const type: OutColorTag = options?.outType ?? ('hex' as OutColorTag)
  const source = anyColorToHslObject(sourceColor, type)
  for (let i = 0; i < size; i++) {
    palette.push(getPaletteColor(i, source, size, options))
  }
  return palette
}
