import { anyColorToHslObject, getColorType } from '../utils/index.js'
import { getPaletteColor } from './helper.js'
import type { AnyColor, ColorTag, HSLObject, PaletteOptions } from '../types.js'

/**
 * 调色板类
 *
 * 该类实现了`Symbol.iterator`方法，支持迭代。
 *
 * @template T - 源色类型
 */
export class Palette<T extends AnyColor = AnyColor> {
  // 源色RGB对象
  private readonly _sourceHsl: HSLObject
  // 缓存色阶颜色
  private readonly _cacheColors: Array<T> = []
  // 色阶数量
  private readonly _size: number
  // 源色
  private readonly _sourceColor: T
  // 输出类型
  private readonly _options: Required<PaletteOptions>
  /**
   * @param {T} sourceColor - 源色
   * @param {number} size - 色阶数量，不能小于9
   * @param {PaletteOptions} [options] - 可选的配置项
   */
  constructor(sourceColor: T, size: number, options?: PaletteOptions) {
    if (typeof size !== 'number' || size < 9) {
      throw new Error('size must be a number and greater than 9')
    }
    this._sourceColor = sourceColor
    this._size = size
    this._sourceHsl = anyColorToHslObject(sourceColor)
    this._cacheColors.length = size
    this._options = Object.assign(
      {
        type: getColorType(sourceColor),
        min: 0,
        max: 1
      },
      options
    )
  }

  /**
   * 源色
   */
  get source(): T {
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
    return this._options.type
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
  get(i: number): T {
    if (!this._cacheColors[i]) {
      this._cacheColors[i] = getPaletteColor(i, this._sourceHsl, this.size, this._options) as T
    }
    return this._cacheColors[i]
  }

  /**
   * 获取所有色阶颜色
   */
  all(): Array<T> {
    return Array.from(this) as Array<T>
  }

  /**
   * 低代器
   */
  [Symbol.iterator](): { next(): IteratorResult<T> } {
    let index = 0
    const length = this.size
    // 返回一个迭代器对象
    return {
      next: (): IteratorResult<T> => {
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
   * @template T - 源色类型
   * @param {AnyColor} sourceColor - 源色
   * @param {number} [size=11] - 色阶数量
   * @param {Object} options - 可选的配置项
   * @returns {Palette<T>} - 调色板实例
   */
  static create<T extends AnyColor>(
    sourceColor: T,
    size: number,
    options?: PaletteOptions
  ): Palette<T> {
    return new Palette(sourceColor, size, options)
  }
}
