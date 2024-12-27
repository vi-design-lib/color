import type { BaseColorScheme, ColorSchemePalettes, ColorSchemeRoles } from '../types.js'
import { Scheme } from './scheme.js'

export class Theme<T extends BaseColorScheme> {
  // 配色方案对应的调色板
  readonly #palettes: ColorSchemePalettes<T>
  readonly #schemes: {
    light: ColorSchemeRoles<T>
    dark: ColorSchemeRoles<T>
  }
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
