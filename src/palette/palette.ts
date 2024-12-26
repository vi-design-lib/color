import { colorToRgbObj } from '../utils/index.js'
import { getPaletteColor } from './helper.js'
import type { HexColor, Out, OutType, RgbColor, RGBObject, StrColors } from '../types.js'

/**
 * 调色板类
 *
 * 该类实现了`Symbol.iterator`方法，支持迭代。
 *
 * @template S - 源色类型，可以是RGB字符串或者HEX字符串
 */
export class Palette<S extends StrColors, OUT extends OutType = 'hex'> {
  // 源色RGB对象
  readonly #sourceRgb: RGBObject
  // 缓存色阶颜色
  readonly #cacheColors: Array<Out<OUT>> = []
  // 色阶数量
  readonly #size: number
  // 色阶颜色类型
  readonly #outType: OUT
  // 源色
  readonly #sourceColor: S
  /**
   * @param {RgbColor | HexColor} sourceColor - 源色
   * @param {number} size - 色阶数量，建议单数，不能小于9
   * @param {OutType} outType - 色阶颜色类型，可以是`hex`|`rgb`|`RGB`
   */
  constructor(sourceColor: S, size: number, outType: OUT = 'hex' as OUT) {
    if (typeof size !== 'number' || size < 9) {
      throw new Error('steps must be a number and greater than 9')
    }
    this.#sourceColor = sourceColor
    this.#size = size
    this.#outType = outType
    this.#sourceRgb = colorToRgbObj(sourceColor)
    this.#cacheColors.length = size
  }

  /**
   * 源色
   */
  get source(): S {
    return this.#sourceColor
  }

  /**
   * 调色板色阶数量
   */
  get size(): number {
    return this.#size
  }

  /**
   * 输出色彩类型
   */
  get outType(): OUT {
    return this.#outType
  }

  /**
   * 获取色阶颜色
   *
   * @param {number} i - 色阶索引，必须小于色阶数量
   */
  get(i: number): Out<OUT> {
    if (!this.#cacheColors[i]) {
      this.#cacheColors[i] = getPaletteColor(
        i,
        this.#sourceRgb,
        this.size,
        this.outType
      ) as Out<OUT>
    }
    return this.#cacheColors[i]
  }
  /**
   * 获取所有色阶颜色
   */
  all(): Array<Out<OUT>> {
    return Array.from(this) as Array<Out<OUT>>
  }

  /**
   * 低代器
   */
  [Symbol.iterator](): { next(): IteratorResult<Out<OUT>> } {
    let index = 0
    const length = this.size
    // 返回一个迭代器对象
    return {
      next: (): IteratorResult<Out<OUT>> => {
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
   * @template T - 源色类型，可以是RGB字符串或者HEX字符串
   * @template O - 色阶颜色类型，可以是`hex`|`rgb`|`RGB`
   * @param {RgbColor | HexColor} sourceColor - 源色
   * @param {number} [steps=11] - 色阶数量
   * @param outType
   * @returns {Palette<T>} - 调色板实例
   */
  static create<T extends RgbColor | HexColor, O extends OutType = 'hex'>(
    sourceColor: T,
    steps: number = 11,
    outType: O = 'hex' as O
  ): Palette<T, O> {
    return new Palette(sourceColor, steps, outType)
  }
}
