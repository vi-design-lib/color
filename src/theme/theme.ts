import type {
  BaseColorScheme,
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
export class Theme<T extends BaseColorScheme> {
  // 配色方案对应的调色板
  readonly #palettes: ColorSchemePalettes<T>
  // 主题配色方案
  readonly #schemes: ThemeSchemes<T>
  constructor(scheme: T) {
    this.#palettes = Scheme.colorSchemeToPalettes(scheme)
    this.#schemes = {
      light: Scheme.lightFromPalettes(this.#palettes),
      dark: Scheme.darkFromPalettes(this.#palettes)
    }
  }

  /**
   * 调色板
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
}
