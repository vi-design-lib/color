import type {
  AnyColor,
  BrightnessScheme,
  ColorScheme,
  ColorSchemePalettes,
  Schemes
} from '../types.js'
import { Scheme } from './scheme.js'

/**
 * 主题
 *
 * @template T - 基准配色方案
 */
export class Theme<T extends AnyColor> {
  // 配色方案对应的调色板
  public readonly palettes: ColorSchemePalettes<T>
  // 色调调色板
  public readonly tonalPalettes: ColorSchemePalettes<T>
  // 主题配色方案模式
  private schemes: BrightnessScheme<T>

  constructor(colors: ColorScheme<T>) {
    this.palettes = Scheme.colorSchemeToPalettes(colors)
    this.tonalPalettes = Scheme.colorSchemeToTonalPalettes(colors)
    this.schemes = {
      light: {
        role: Scheme.createColorSchemeRoles(this.palettes, 'light'),
        tonal: Scheme.createColorSchemeTonal(this.tonalPalettes, 'light')
      },
      dark: {
        role: Scheme.createColorSchemeRoles(this.palettes, 'dark'),
        tonal: Scheme.createColorSchemeTonal(this.tonalPalettes, 'dark')
      }
    }
  }

  /**
   * 获取主题配色方案
   *
   * @returns {Object} 主题配色方案
   */
  get light(): Schemes<T> {
    return this.schemes.light
  }

  /**
   * 获取暗黑主题配色方案
   *
   * @returns {Object} 暗黑主题配色方案
   */
  get dark(): Schemes<T> {
    return this.schemes.dark
  }
}
