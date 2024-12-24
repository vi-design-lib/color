import { colorToRgbObj, type HEXColor, type RgbColor, type RgbColorObj } from '../utils/index.js'
import { getPaletteColor } from './helper.js'

export interface PaletteOptions {
  /**
   * 色阶颜色类型
   *
   * @default 'hex'
   */
  outType?: 'hex' | 'rgb'
}

/**
 * 调色板类
 *
 * 该类实现了`Symbol.iterator`方法，支持迭代。
 *
 * @template S - 源色类型，可以是RGB字符串或者HEX字符串
 */
export class Palette<S extends RgbColor | HEXColor> {
  // 源色RGB对象
  readonly #sourceRgb: RgbColorObj
  // 缓存色阶颜色
  readonly #cacheColors: string[] = []
  /**
   * @param {RgbColor | HEXColor} sourceColor - 源色
   * @param {number} [steps=10] - 色阶数量
   * @param {PaletteOptions} [options={outType: 'hex'}] - 可选配置
   */
  constructor(
    protected readonly sourceColor: S,
    protected readonly steps: number = 10,
    protected readonly options: PaletteOptions = {}
  ) {
    const stepsType = typeof steps
    if (stepsType !== 'number' || steps < 10) {
      throw new Error('steps must be a number and greater than 10')
    }
    this.#sourceRgb = colorToRgbObj(sourceColor)
    this.#cacheColors.length = steps
  }

  /**
   * 输出类型
   */
  get outType(): 'hex' | 'rgb' {
    return this.options.outType !== 'rgb' ? 'hex' : 'rgb'
  }

  /**
   * 源色
   */
  get source(): S {
    return this.sourceColor
  }

  /**
   * 获取色阶颜色
   *
   * @param {number} i - 色阶索引，必须小于色阶数量
   */
  get(i: number): string {
    if (!this.#cacheColors[i]) {
      this.#cacheColors[i] = getPaletteColor(i, this.#sourceRgb, this.steps, this.outType)
    }
    return this.#cacheColors[i]
  }

  /**
   * 获取所有色阶颜色
   */
  all(): string[] {
    return Array.from(this)
  }

  /**
   * 低代器
   */
  [Symbol.iterator](): { next(): IteratorResult<string> } {
    let index = 0
    const length = this.steps
    // 返回一个迭代器对象
    return {
      next: (): IteratorResult<string> => {
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
   * @param {RgbColor | HEXColor} sourceColor - 源色
   * @param {number} [steps=11] - 色阶数量
   * @param {PaletteOptions} [options] - 可选配置
   * @returns {Palette<T>} - 调色板实例
   */
  static create<T extends RgbColor | HEXColor>(
    sourceColor: T,
    steps: number = 11,
    options?: PaletteOptions
  ): Palette<T> {
    return new Palette(sourceColor, steps, options)
  }
}
