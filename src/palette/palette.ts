import { anyColorToHslObject, getColorType } from '../utils/index.js'
import { getPaletteColor } from './helper.js'
import type { AnyColor, ColorTag, HSLObject } from '../types.js'

/**
 * 调色板类
 *
 * 该类实现了`Symbol.iterator`方法，支持迭代。
 *
 * @template T - 源色类型
 */
export class Palette<T extends AnyColor = AnyColor> {
  // 源色RGB对象
  readonly #sourceHsl: HSLObject
  // 缓存色阶颜色
  readonly #cacheColors: Array<T> = []
  // 色阶数量
  readonly #size: number
  // 源色
  readonly #sourceColor: T
  // 输出类型
  readonly #outType: ColorTag
  /**
   * @param {T} sourceColor - 源色
   * @param {number} size - 色阶数量，建议单数，不能小于9
   */
  constructor(sourceColor: T, size: number) {
    if (typeof size !== 'number' || size < 9) {
      throw new Error('size must be a number and greater than 9')
    }
    this.#sourceColor = sourceColor
    this.#size = size
    this.#sourceHsl = anyColorToHslObject(sourceColor)
    this.#cacheColors.length = size
    this.#outType = getColorType(sourceColor)
  }

  /**
   * 源色
   */
  get source(): T {
    return this.#sourceColor
  }

  /**
   * 调色板色阶数量
   */
  get size(): number {
    return this.#size
  }

  /**
   * 获取色阶颜色
   *
   * @param {number} i - 色阶索引，必须小于色阶数量
   */
  get(i: number): T {
    if (!this.#cacheColors[i]) {
      this.#cacheColors[i] = getPaletteColor(i, this.#sourceHsl, this.size, this.#outType) as T
    }
    return this.#cacheColors[i]
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
   * @returns {Palette<T>} - 调色板实例
   */
  static create<T extends AnyColor>(sourceColor: T, size: number): Palette<T> {
    return new Palette(sourceColor, size)
  }
}
