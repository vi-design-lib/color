import { anyColorToHslObject, getColorType } from '../utils/index.js'
import { getPaletteColor } from './helper.js'
import type { AnyColor, ColorTag, ColorTagToColorType, HSLObject } from '../types.js'

/**
 * 调色板可选配置
 *
 * @template OutColorTag - 调色板输出的颜色标签类型，默认为hex
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
   * 调试板要使用的目标类型
   */
  outType?: OutColorTag
}

/**
 * 调色板类
 *
 * 该类实现了`Symbol.iterator`方法，支持迭代。
 *
 * @template SourceColor - sourceColor的类型
 * @template OutColorTag - 调色板输出的颜色标签
 * @template OutColorType - 调色板输出的颜色类型，根据`OutColorTag`类型自动转换，无需手动传入！
 */
export class Palette<
  SourceColor extends AnyColor = AnyColor,
  OutColorTag extends ColorTag = 'hex',
  OutColorType extends AnyColor = ColorTagToColorType<OutColorTag>
> {
  // 源色RGB对象
  private readonly _sourceHsl: HSLObject
  // 缓存色阶颜色
  private readonly _cacheColors: Array<OutColorType> = []
  // 色阶数量
  private readonly _size: number
  // 源色
  private readonly _sourceColor: SourceColor
  // 输出类型
  private readonly _options: Required<PaletteOptions<OutColorTag>>
  /**
   * @param {SourceColor} sourceColor - 源色
   * @param {number} size - 色阶数量，不能小于9
   * @param {PaletteOptions} [options] - 可选的配置项
   * @param {OutColorTag} [options.outType=hex] - 调色板输出的颜色类型，默认为sourceColor的类型
   * @param {number} [options.min] - 调色板最小亮度，默认为0
   * @param {number} [options.max] - 调色板最大亮度，默认为1
   */
  constructor(sourceColor: SourceColor, size: number, options?: PaletteOptions<OutColorTag>) {
    if (typeof size !== 'number' || size < 9) {
      throw new Error('size must be a number and greater than 9')
    }
    this._sourceColor = sourceColor
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
   * 源色
   */
  get source(): SourceColor {
    return this._sourceColor
  }

  /**
   * 源色HSL对象
   *
   * @returns {HSLObject} - 源色HSL对象的拷贝
   */
  get hsl(): HSLObject {
    return { ...this._sourceHsl }
  }

  /**
   * 调色板色彩类型
   */
  get type(): ColorTag {
    return this._options.outType
  }

  /**
   * 调色板色阶数量
   */
  get size(): number {
    return this._size
  }

  /**
   * 获取色阶颜色
   *
   * @param {number} i - 色阶索引，必须小于色阶数量
   */
  get(i: number): OutColorType {
    if (!this._cacheColors[i]) {
      this._cacheColors[i] = getPaletteColor(
        i,
        this._sourceHsl,
        this.size,
        this._options
      ) as unknown as OutColorType
    }
    return this._cacheColors[i]
  }

  /**
   * 获取所有色阶颜色
   *
   * @returns {Array<OutColorType>} - 所有色阶颜色
   */
  all(): Array<OutColorType> {
    return Array.from(this) as unknown as Array<OutColorType>
  }

  /**
   * 迭代器方法
   */
  [Symbol.iterator](): { next(): IteratorResult<OutColorType> } {
    let index = 0
    const length = this.size
    // 返回一个迭代器对象
    return {
      next: (): IteratorResult<OutColorType> => {
        if (index < length) {
          return { value: this.get(index++), done: false }
        } else {
          return { value: undefined, done: true }
        }
      }
    }
  }

  /**
   * 创建调色板
   *
   * @template SourceColor - 源色类型
   * @template OutColorTag - 调色板输出的颜色标签类型，默认为hex
   * @param {AnyColor} sourceColor - 源色
   * @param {number} size - 色阶数量
   * @param {PaletteOptions<OutColorTag>} [options] - 可选的配置项
   * @returns {Palette<SourceColor, OutColorTag>} - 调色板实例
   */
  static create<SourceColor extends AnyColor, OutColorTag extends ColorTag = 'hex'>(
    sourceColor: SourceColor,
    size: number,
    options?: PaletteOptions<OutColorTag>
  ): Palette<SourceColor, OutColorTag> {
    return new Palette(sourceColor, size, options)
  }
}
