import { anyColorToHslObject, anyColorToTargetColor } from '../utils/index.js'
import { type PaletteOptions } from './palette.js'
import type { AnyColor, ColorTag, ColorTagToColorType } from '../types.js'

/**
 * 获取调色板中指定索引位置的颜色
 *
 * 根据给定的索引、源色和色阶数量，计算并返回调色板中对应位置的颜色。
 * 颜色的亮度会根据索引在色阶中的位置进行插值计算。
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为'hex'
 * @param {number} i - 色阶索引，范围为0~(size-1)，如果超出范围会被限制在有效范围内
 * @param {AnyColor} sourceColor - 源色，作为调色板的基准颜色
 * @param {number} size - 色阶数量，决定调色板的颜色分级数
 * @param {PaletteOptions<OutColorTag>} [options] - 调色板选项，可选
 * @param {number} [options.min] - 最小亮度值，默认为0
 * @param {number} [options.max] - 最大亮度值，默认为1
 * @param {OutColorTag} [options.outType] - 输出颜色类型，默认为'hex'
 * @returns {ColorTagToColorType<OutColorTag>} - 计算得到的调色板颜色，类型由OutColorTag决定
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
  const newL = minL + factor * (maxL - minL)
  return anyColorToTargetColor({ h, s, l: newL }, type)
}

/**
 * 生成完整的调色板色阶数组
 *
 * 根据给定的源色和色阶数量，生成一个包含所有色阶颜色的数组。
 * 色阶颜色从深色到浅色排列，当色阶总数为奇数时，最中间的色阶接近源色。
 *
 * 性能建议：
 * 1. 如果只需获取某个特定色阶的颜色，请使用 {@link getPaletteColor} 函数。
 * 2. 对于频繁使用的场景，建议通过 `new Palette(sourceColor, size)` 实例化 {@linkcode Palette} 对象，
 *    然后使用该对象提供的方法来获取颜色，这样性能更佳。
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为'hex'
 * @param {AnyColor} sourceColor - 源颜色，作为调色板的基准颜色
 * @param {number} size - 色阶的数量，决定调色板的颜色分级数
 * @param {PaletteOptions<OutColorTag>} [options] - 调色板选项，可选
 * @param {number} [options.min] - 最小亮度值，默认为0
 * @param {number} [options.max] - 最大亮度值，默认为1
 * @param {OutColorTag} [options.outType] - 输出颜色类型，默认为'hex'
 * @returns {Array<ColorTagToColorType<OutColorTag>>} - 包含所有色阶颜色的数组，从深色到浅色排列
 */
export function makePaletteArray<OutColorTag extends ColorTag = 'hex'>(
  sourceColor: AnyColor,
  size: number,
  options?: PaletteOptions<OutColorTag>
): Array<ColorTagToColorType<OutColorTag>> {
  const palette: Array<ColorTagToColorType<OutColorTag>> = []
  for (let i = 0; i < size; i++) {
    palette.push(getPaletteColor(i, sourceColor, size, options))
  }
  return palette
}
