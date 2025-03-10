import type {
  AnyColor,
  BrightnessScheme,
  ColorScheme,
  ColorSchemePalettes,
  ColorSchemeRoles,
  ColorSchemeTonal,
  ColorToColorType,
  HSLObject,
  NeutralColorRoles,
  PaletteExtractionColorRules,
  Schemes
} from '../types.js'
import {
  anyColorToHslObject,
  anyColorToTargetColor,
  capitalize,
  getColorType,
  HslFormula
} from '../utils/index.js'
import { Palette } from '../palette/index.js'

/**
 * 配色方案
 *
 * 可以重写类中的静态方法，以自定义配色方案。
 */
export default class Scheme<T extends AnyColor> {
  /**
   * 角色方案对应的调色板
   */
  public readonly palettes: ColorSchemePalettes<T>
  /**
   * 色调调色板
   */
  public readonly tonalPalettes: ColorSchemePalettes<T>
  /**
   * 亮度配色方案
   */
  public readonly bright: BrightnessScheme<T>

  constructor(colors: ColorScheme<T>) {
    this.palettes = Scheme.colorSchemeToPalettes(colors)
    this.tonalPalettes = Scheme.colorSchemeToTonalPalettes(colors)
    this.bright = {
      light: {
        roles: Scheme.createColorSchemeRoles(this.palettes, 'light'),
        tonal: Scheme.createColorSchemeTonal(this.tonalPalettes, 'light')
      },
      dark: {
        roles: Scheme.createColorSchemeRoles(this.palettes, 'dark'),
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
    return this.bright.light
  }

  /**
   * 获取暗黑主题配色方案
   *
   * @returns {Object} 暗黑主题配色方案
   */
  get dark(): Schemes<T> {
    return this.bright.dark
  }
  /**
   * 获取浅色模式下的颜色角色
   *
   * @returns {Object} 浅色模式下的颜色角色
   */
  get lightRoles(): ColorSchemeRoles<T> {
    return this.bright.light.roles
  }

  /**
   * 获取深色模式下的颜色角色
   *
   * @returns {Object} 深色模式下的颜色角色
   */
  get darkRoles(): ColorSchemeRoles<T> {
    return this.bright.dark.roles
  }

  /**
   * 获取浅色模式下的色调
   *
   * @returns {Object} 浅色模式下的色调
   */
  get lightTonal(): ColorSchemeTonal<T> {
    return this.bright.light.tonal
  }

  /**
   * 获取深色模式下的色调
   *
   * @returns {Object} 深色模式下的色调
   */
  get darkTonal(): ColorSchemeTonal<T> {
    return this.bright.dark.tonal
  }

  /**
   * 暗色模式调色板取色规则
   */
  static readonly darkRoleRule: PaletteExtractionColorRules = {
    source: 80,
    onSource: 10,
    sourceHover: 72,
    onSourceHover: 24,
    sourceActive: 60,
    onSourceActive: 10,
    sourceDisabled: 18,
    onSourceDisabled: 40,
    container: 20,
    onContainer: 80,
    base: {
      surface: 6,
      surfaceVariant: 30,
      onSurface: 90,
      onSurfaceVariant: 90,
      inverseSurface: 90,
      inverseOnSurface: 20,
      surfaceDim: 6,
      surfaceBright: 24,
      surfaceContainerLowest: 4,
      surfaceContainer: 12,
      surfaceContainerLow: 10,
      surfaceContainerHigh: 17,
      surfaceContainerHighest: 24,
      outline: 40,
      outlineVariant: 20,
      shadow: 0,
      background: 6,
      onBackground: 90
    }
  }
  /**
   * 亮色模式调色板取色规则
   */
  static readonly lightRoleRule: PaletteExtractionColorRules = {
    source: 46,
    onSource: 98,
    sourceHover: 66,
    onSourceHover: 100,
    sourceActive: 52,
    onSourceActive: 88,
    sourceDisabled: 68,
    onSourceDisabled: 92,
    container: 90,
    onContainer: 30,
    base: {
      surface: 98,
      surfaceVariant: 90,
      inverseSurface: 20,
      inverseOnSurface: 95,
      surfaceDim: 87,
      surfaceBright: 98,
      surfaceContainerLowest: 100,
      surfaceContainer: 96,
      surfaceContainerLow: 94,
      surfaceContainerHigh: 92,
      surfaceContainerHighest: 90,
      onSurface: 10,
      onSurfaceVariant: 30,
      outline: 50,
      outlineVariant: 90,
      shadow: 0,
      background: 98,
      onBackground: 10
    }
  }

  /**
   * 根据主色创建基准颜色配色方案
   *
   * @template T - 颜色类型
   * @param {AnyColor} primary - 主色
   * @returns {ColorScheme<T>} - 基准颜色配色方案
   */
  static createBaseColorScheme<T extends AnyColor>(primary: T): ColorScheme<ColorToColorType<T>> {
    const outType = getColorType(primary)
    // 获取主色的 HSL 对象
    const primaryHsl = anyColorToHslObject(primary, outType)
    // 获取主色的 HSL 值
    const { h, s, l } = primaryHsl

    // 亮度调整，确保不会过亮或过暗
    const adjustedLightness = parseFloat(Math.min(Math.max(l * 1.1, 0), 1).toFixed(2)) // 保持亮度在 [0, 1] 范围内
    const sl = { s: HslFormula.ratioAdjust(s, 0.9), l: adjustedLightness }
    // 使用黄色做为警告色
    const warningHsl = { h: 30, ...sl } // 黄色范围
    // 固定红色范围的危险色
    const errorHsl = { h: 0, ...sl } // 红色范围

    // 生成辅色和次要辅色的色相
    const auxHue = HslFormula.adjacentHue(h, -45) // 基于主色的相邻色 反向偏移
    const minorHue = HslFormula.adjacentHue(h, 45) // 基于主色的相邻色，正向偏移
    // 确保辅色和三级辅色的饱和度低于主色
    const auxHsl = { h: auxHue, s: HslFormula.ratioAdjust(s, 0.8), l: adjustedLightness }
    const minorHsl = { h: minorHue, s: HslFormula.ratioAdjust(s, 0.7), l: adjustedLightness }

    // 生成中性色：灰色调带有主色调
    const neutralHsl = { h, s: 0.1, l: l * 0.9 } // 灰色带有主色调的HSL

    // 创建 HSL 配色方案
    const hslScheme: ColorScheme<HSLObject> = {
      primary: primaryHsl,
      aux: auxHsl,
      minor: minorHsl,
      warning: warningHsl,
      error: errorHsl,
      neutral: neutralHsl
    }

    if (outType !== 'HSL') {
      // 将 HSL 配色方案转换为 RGB 或 HEX
      for (const hslSchemeKey in hslScheme) {
        const key = hslSchemeKey as keyof ColorScheme<T>
        const hsl = hslScheme[key]
        hslScheme[key] = anyColorToTargetColor(hsl, outType, 'HSL') as any
      }
    }

    return hslScheme as ColorScheme<ColorToColorType<T>>
  }

  /**
   * 基准配色方案调色板
   *
   * @template T - 配色方案类型
   * @param {T} scheme - 配色方案
   * @returns {ColorSchemePalettes<T>} 配色方案的调色板，色阶范围0-100
   */
  static colorSchemeToPalettes<T extends AnyColor>(scheme: ColorScheme<T>): ColorSchemePalettes<T> {
    return Object.fromEntries(
      Object.entries(scheme).map(([key, value]) => [key, Palette.create(value, 101)])
    ) as unknown as ColorSchemePalettes<T>
  }

  /**
   * 将颜色方案转换为简单的调试板
   *
   * @template T - 配色方案类型
   * @param {T} scheme - 配色方案
   * @returns {ColorSchemePalettes<T>} 配色方案的调色板，色阶范围0-9
   */
  static colorSchemeToTonalPalettes<T extends AnyColor>(
    scheme: ColorScheme<T>
  ): ColorSchemePalettes<T> {
    return Object.fromEntries(
      Object.entries(scheme).map(([key, value]) => [
        key,
        Palette.create(value, 10, { min: 0.1, max: 0.9 })
      ])
    ) as unknown as ColorSchemePalettes<T>
  }

  /**
   * 创建角色配色方案
   *
   * @template T - BaseColorScheme
   * @param {ColorSchemePalettes<T>} palettes - 基准配色调色板
   * @param {'light' | 'dark'} mode - 主题模式
   */
  static createColorSchemeRoles<T extends AnyColor>(
    palettes: ColorSchemePalettes<T>,
    mode: 'light' | 'dark'
  ): ColorSchemeRoles<T> {
    const rule = mode === 'dark' ? this.darkRoleRule : this.lightRoleRule
    const roles: Record<string, any> = {}
    for (const [key, palette] of Object.entries(palettes)) {
      // 跳过中性色，中性色由surface代替
      if (key === 'neutral') continue

      roles[key] = palette.get(rule.source)
      roles[`${key}Hover`] = palette.get(rule.sourceHover)
      roles[`${key}Active`] = palette.get(rule.sourceActive)
      roles[`${key}Disabled`] = palette.get(rule.sourceDisabled)

      roles[`on${capitalize(key)}`] = palette.get(rule.onSource)
      roles[`on${capitalize(key)}Hover`] = palette.get(rule.onSourceHover)
      roles[`on${capitalize(key)}Active`] = palette.get(rule.onSourceActive)

      roles[`on${capitalize(key)}Disabled`] = palettes.neutral.get(rule.onSourceDisabled)

      roles[`${key}Container`] = palette.get(rule.container)

      roles[`on${capitalize(key)}Container`] = palette.get(rule.onContainer)
    }
    const palette = palettes.neutral
    const baseRoles: NeutralColorRoles<T> = {} as NeutralColorRoles<T>
    for (const [key, value] of Object.entries(rule.base)) {
      baseRoles[key as keyof NeutralColorRoles<T>] = palette.get(value)
    }
    Object.assign(roles, baseRoles)
    return roles as ColorSchemeRoles<T>
  }

  /**
   * 创建色调配色方案
   *
   * @param {Object} palettes - 调色板
   * @param {string} mode - 主题模式
   */
  static createColorSchemeTonal<T extends AnyColor>(
    palettes: ColorSchemePalettes<T>,
    mode: 'light' | 'dark'
  ): ColorSchemeTonal<T> {
    const toneIndex = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const tonal: Record<string, T> = {}
    for (const [key, palette] of Object.entries(palettes)) {
      const colors = mode === 'light' ? palette.all().reverse() : palette.all()
      for (const index of toneIndex) {
        tonal[`${key}-${index}`] = colors[index - 1]
      }
    }
    return tonal as ColorSchemeTonal<T>
  }
}
