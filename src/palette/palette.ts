import { anyColorToHslObject, anyColorToTargetColor, getColorType } from '../utils/index.js'
import { getPaletteColor } from './helper.js'
import type { AnyColor, ColorTag, ColorTagToColorType, HSLObject } from '../types.js'

/**
 * 调色板可选配置
 *
 * 用于配置调色板的亮度范围和输出颜色类型。
 *
 * @template OutColorTag - 调色板输出的颜色标签类型，默认为'hex'
 */
export type PaletteOptions<OutColorTag extends ColorTag = 'hex'> = {
  /**
   * 调色板最小亮度，默认为0
   *
   * @default 0
   */
  min?: number
  /**
   * 调色板最大亮度，默认为1
   *
   * @default 1
   */
  max?: number
  /**
   * 调色板要使用的目标类型
   *
   * @default hex
   */
  outType?: OutColorTag
}

/**
 * 调色板类
 *
 * 用于生成和管理基于源色的色阶系列。该类实现了`Symbol.iterator`方法，支持迭代操作，
 * 可以方便地遍历所有色阶颜色。
 *
 * @template OutColorTag - 调色板输出的颜色标签类型，默认为'hex'
 */
export class Palette<OutColorTag extends ColorTag = 'hex'> {
  // 源色HSL对象，用于色阶计算的基础
  private readonly _sourceHsl: HSLObject
  // 缓存色阶颜色，避免重复计算
  private readonly _cacheColors: Array<ColorTagToColorType<OutColorTag>> = []
  // 色阶数量，决定调色板的颜色分级数
  private readonly _size: number
  // 源色，作为调色板的基准颜色
  private readonly _sourceColor: ColorTagToColorType<OutColorTag>
  // 调色板配置选项
  private readonly _options: Required<PaletteOptions<OutColorTag>>
  /**
   * 创建调色板实例
   *
   * @param {AnyColor} sourceColor - 源色，作为调色板的基准颜色
   * @param {number} size - 色阶数量，不能小于9，决定调色板的颜色分级数
   * @param {PaletteOptions<OutColorTag>} [options] - 可选的配置项
   * @param {OutColorTag} [options.outType=hex] - 调色板输出的颜色类型，默认为sourceColor的类型
   * @param {number} [options.min=0] - 调色板最小亮度，默认为0，影响最深色的亮度
   * @param {number} [options.max=1] - 调色板最大亮度，默认为1，影响最浅色的亮度
   * @throws {Error} 当size小于9或不是数字时抛出错误
   */
  constructor(sourceColor: AnyColor, size: number, options?: PaletteOptions<OutColorTag>) {
    if (typeof size !== 'number' || size < 9) {
      throw new Error('size must be a number and greater than 9')
    }
    this._sourceColor = anyColorToTargetColor(
      sourceColor,
      options?.outType || ('hex' as OutColorTag)
    )
    this._size = size
    this._sourceHsl = anyColorToHslObject(sourceColor)
    this._cacheColors.length = size
    this._options = Object.assign(
      {
        outType: getColorType(sourceColor),
        min: 0,
        max: 1
      },
      options
    )
  }

  /**
   * 获取源色
   *
   * @returns {ColorTagToColorType<OutColorTag>} 调色板的基准颜色
   */
  get source(): ColorTagToColorType<OutColorTag> {
    return this._sourceColor
  }

  /**
   * 获取源色HSL对象
   *
   * 返回源色的HSL表示形式，用于色彩计算和转换。
   *
   * @returns {HSLObject} 源色HSL对象的拷贝，避免外部修改
   */
  get hsl(): HSLObject {
    return { ...this._sourceHsl }
  }

  /**
   * 获取调色板色彩类型
   *
   * @returns {ColorTag} 调色板输出的颜色类型标签
   */
  get type(): ColorTag {
    return this._options.outType
  }

  /**
   * 获取调色板色阶数量
   *
   * @returns {number} 调色板的颜色分级数
   */
  get size(): number {
    return this._size
  }

  /**
   * 获取指定索引的色阶颜色
   *
   * 根据索引获取对应的色阶颜色，如果该颜色尚未计算，则会计算并缓存。
   *
   * @param {number} i - 色阶索引，范围为0~(size-1)
   * @returns {ColorTagToColorType<OutColorTag>} 指定索引的色阶颜色
   */
  get(i: number): ColorTagToColorType<OutColorTag> {
    if (!this._cacheColors[i]) {
      this._cacheColors[i] = getPaletteColor(i, this._sourceHsl, this.size, this._options)
    }
    return this._cacheColors[i]
  }

  /**
   * 获取所有色阶颜色
   *
   * 返回包含调色板所有色阶颜色的数组，从深色到浅色排列。
   *
   * @returns {Array<ColorTagToColorType<OutColorTag>>} 包含所有色阶颜色的数组
   */
  all(): Array<ColorTagToColorType<OutColorTag>> {
    return Array.from(this) as unknown as Array<ColorTagToColorType<OutColorTag>>
  }

  /**
   * 迭代器方法
   *
   * 实现Symbol.iterator接口，使调色板对象可以被for...of循环遍历，
   * 按索引顺序返回所有色阶颜色。
   *
   * @returns {Iterator<ColorTagToColorType<OutColorTag>>} 调色板颜色的迭代器
   */
  [Symbol.iterator](): { next(): IteratorResult<ColorTagToColorType<OutColorTag>> } {
    let index = 0
    const length = this.size
    // 返回一个迭代器对象
    return {
      next: (): IteratorResult<ColorTagToColorType<OutColorTag>> => {
        if (index < length) {
          return { value: this.get(index++), done: false }
        } else {
          return { value: undefined, done: true }
        }
      }
    }
  }

  /**
   * 创建调色板的静态工厂方法
   *
   * 提供一种便捷的方式来创建调色板实例，无需使用new关键字。
   *
   * @template OutColorTag - 调色板输出的颜色标签类型，默认为'hex'
   * @param {AnyColor} sourceColor - 源色，作为调色板的基准颜色
   * @param {number} size - 色阶数量，决定调色板的颜色分级数
   * @param {PaletteOptions<OutColorTag>} [options] - 可选的配置项
   * @returns {Palette<OutColorTag>} 新创建的调色板实例
   */
  static create<OutColorTag extends ColorTag = 'hex'>(
    sourceColor: AnyColor,
    size: number,
    options?: PaletteOptions<OutColorTag>
  ): Palette<OutColorTag> {
    return new Palette(sourceColor, size, options)
  }
}
