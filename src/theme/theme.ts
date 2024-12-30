import type {
  AnyColor,
  ColorScheme,
  ColorSchemePalettes,
  ColorSchemeRoles,
  ThemeSchemes
} from '../types.js'
import { Scheme } from './scheme.js'

/**
 * 主题
 *
 * @template T - 基准配色方案
 */
export class Theme<T extends AnyColor> {
  // 配色方案对应的调色板
  readonly #palettes: ColorSchemePalettes<T>
  // 主题配色方案模式
  readonly #schemes: ThemeSchemes<T>
  // 主题配色方案
  readonly #colors: ColorScheme<T>

  // 构造函数
  constructor(colors: ColorScheme<T>) {
    this.#colors = colors
    this.#palettes = Scheme.colorSchemeToPalettes(colors)
    this.#schemes = {
      light: Scheme.lightFromPalettes(this.#palettes),
      dark: Scheme.darkFromPalettes(this.#palettes)
    }
  }

  /**
   * 调色板
   *
   * 色阶可选值的范围0-100
   */
  get palettes(): Readonly<ColorSchemePalettes<T>> {
    return this.#palettes
  }

  /**
   * 亮色配色方案
   */
  get light(): ColorSchemeRoles<T> {
    return this.#schemes.light
  }

  /**
   * 暗色配色方案
   */
  get dark(): ColorSchemeRoles<T> {
    return this.#schemes.dark
  }

  /**
   * 将主题方案转换为JSON字符串
   *
   * 包含亮色和暗色配色方案
   *
   * @returns {string} - JSON字符串
   */
  public toJson(): string {
    return JSON.stringify(this.#schemes)
  }

  /**
   * 主题配色方案
   *
   * @returns {ThemeSchemes<T>} - 主题配色方案
   */
  get schemes(): ThemeSchemes<T> {
    return this.#schemes
  }

  /**
   * 源配色方案
   *
   * @returns {ColorScheme<T>} - 源配色方案
   */
  get colors(): ColorScheme<T> {
    return this.#colors
  }
}
