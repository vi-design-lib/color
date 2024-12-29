import type {
  AnyColor,
  BaseColorRoles,
  ColorScheme,
  ColorSchemePalettes,
  ColorSchemeRoles,
  ColorToColorType,
  HSLObject,
  PaletteExtractionColorRules
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
 * 该类没有任何动态方法，提供了一些静态方法，用于创建配色方案。
 *
 * 可以重写类中的静态方法，以自定义配色方案。
 */
export class Scheme {
  /**
   * 暗色模式调色板取色规则
   */
  static readonly darkRule: PaletteExtractionColorRules = {
    source: 80,
    onSource: 20,
    sourceHover: 72,
    onSourceHover: 24,
    sourceActive: 60,
    onSourceActive: 10,
    sourceDisabled: 20,
    onSourceDisabled: 60,
    container: 30,
    onContainer: 90
  }
  /**
   * 亮色模式调色板取色规则
   */
  static readonly lightRule: PaletteExtractionColorRules = {
    source: 46,
    onSource: 98,
    sourceHover: 66,
    onSourceHover: 100,
    sourceActive: 52,
    onSourceActive: 88,
    sourceDisabled: 68,
    onSourceDisabled: 92,
    container: 90,
    onContainer: 30
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

    // 使用主色的反向互补颜色做为警告颜色
    const warningHsl = { h: HslFormula.complementaryHue(h), ...sl }

    // 固定红色范围的危险色
    const dangerHsl = { h: 0, ...sl } // 红色范围

    // 生成辅色和次要辅色的色相
    const auxHue = HslFormula.adjacentHue(h, -30) // 基于主色的相邻色 反向偏移
    const minorHue = HslFormula.adjacentHue(h, 30) // 基于主色的相邻色，正向偏移

    // 确保辅色和三级辅色的饱和度低于主色
    const auxHsl = { h: auxHue, s: HslFormula.ratioAdjust(s, 0.8), l: adjustedLightness }
    const minorHsl = { h: minorHue, s: HslFormula.ratioAdjust(s, 0.7), l: adjustedLightness }

    // 生成中性色：灰色调带有主色调
    const neutralHsl = { h, s: 0.1, l: l * 0.9 } // 灰色带有主色调的HSL

    // 创建 HSL 配色方案
    const hslScheme: ColorScheme<HSLObject> = {
      main: primaryHsl,
      aux: auxHsl,
      minor: minorHsl,
      warning: warningHsl,
      danger: dangerHsl,
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
   * @returns {ColorSchemePalettes<T>} 配色方案的调色板
   */
  static colorSchemeToPalettes<T extends AnyColor>(scheme: ColorScheme<T>): ColorSchemePalettes<T> {
    return Object.fromEntries(
      Object.entries(scheme).map(([key, value]) => [key, Palette.create(value, 101)])
    ) as unknown as ColorSchemePalettes<T>
  }

  /**
   * 亮色主题配色方案
   *
   * @template T - BaseColorScheme
   * @param {ColorSchemePalettes<T>} palettes - 基准配色调色板
   * @returns {ColorSchemeRoles<T>} 亮色主题配色方案的角色
   */
  static lightFromPalettes<T extends AnyColor>(
    palettes: ColorSchemePalettes<T>
  ): ColorSchemeRoles<T> {
    const roles: Record<string, any> = {}
    for (const [key, palette] of Object.entries(palettes)) {
      // 跳过中性色，中性色由surface代替
      if (key === 'neutral') continue

      roles[key] = palette.get(this.lightRule.source)
      roles[`${key}Hover`] = palette.get(this.lightRule.sourceHover)
      roles[`${key}Active`] = palette.get(this.lightRule.sourceActive)
      roles[`${key}Disabled`] = palette.get(this.lightRule.sourceDisabled)

      roles[`on${capitalize(key)}`] = palette.get(this.lightRule.onSource)
      roles[`on${capitalize(key)}Hover`] = palette.get(this.lightRule.onSourceHover)
      roles[`on${capitalize(key)}Active`] = palette.get(this.lightRule.onSourceActive)
      roles[`on${capitalize(key)}Disabled`] = palette.get(this.lightRule.onSourceDisabled)

      roles[`${key}Container`] = palette.get(this.lightRule.container)

      roles[`on${capitalize(key)}Container`] = palette.get(this.lightRule.onContainer)
    }
    const neutral = palettes.neutral
    const neutralRoles: BaseColorRoles<T> = {
      surface: neutral.get(98),
      inverseSurface: neutral.get(20),
      inverseOnSurface: neutral.get(95),
      surfaceDim: neutral.get(87),
      surfaceBright: neutral.get(98),
      surfaceContainerLowest: neutral.get(100),
      surfaceContainer: neutral.get(96),
      surfaceContainerLow: neutral.get(94),
      surfaceContainerHigh: neutral.get(92),
      surfaceContainerHighest: neutral.get(90),
      onSurface: neutral.get(10),
      onSurfaceVariant: neutral.get(30),
      outline: neutral.get(50),
      outlineVariant: neutral.get(80),
      shadow: neutral.get(0)
    }
    Object.assign(roles, neutralRoles)
    Object.assign(roles, neutralRoles)
    return roles as ColorSchemeRoles<T>
  }

  /**
   * 暗色主题配色方案
   *
   * @template T - BaseColorScheme
   * @param {ColorSchemePalettes<T>} palettes - 基准配色调色板
   * @returns {ColorSchemeRoles<T>} 暗色主题配色方案的角色
   */
  static darkFromPalettes<T extends AnyColor>(
    palettes: ColorSchemePalettes<T>
  ): ColorSchemeRoles<T> {
    const roles: Record<string, any> = {}
    for (const [key, palette] of Object.entries(palettes)) {
      // 跳过中性色，中性色由surface代替
      if (key === 'neutral') continue

      roles[key] = palette.get(this.darkRule.source)
      roles[`${key}Hover`] = palette.get(this.darkRule.sourceHover)
      roles[`${key}Active`] = palette.get(this.darkRule.sourceActive)
      roles[`${key}Disabled`] = palette.get(this.darkRule.sourceDisabled)

      roles[`on${capitalize(key)}`] = palette.get(this.darkRule.onSource)
      roles[`on${capitalize(key)}Hover`] = palette.get(this.darkRule.onSourceHover)
      roles[`on${capitalize(key)}Active`] = palette.get(this.darkRule.onSourceActive)
      roles[`on${capitalize(key)}Disabled`] = palettes.neutral.get(this.darkRule.onSourceDisabled)

      roles[`${key}Container`] = palette.get(this.darkRule.container)

      roles[`on${capitalize(key)}Container`] = palette.get(this.darkRule.onContainer)
    }
    const neutral = palettes.neutral
    const neutralRoles: BaseColorRoles<T> = {
      surface: neutral.get(6),
      inverseSurface: neutral.get(90),
      inverseOnSurface: neutral.get(20),
      surfaceDim: neutral.get(6),
      surfaceBright: neutral.get(24),
      surfaceContainerLowest: neutral.get(4),
      surfaceContainer: neutral.get(12),
      surfaceContainerLow: neutral.get(10),
      surfaceContainerHigh: neutral.get(17),
      surfaceContainerHighest: neutral.get(24),
      onSurface: neutral.get(90),
      onSurfaceVariant: neutral.get(90),
      outline: neutral.get(60),
      outlineVariant: neutral.get(30),
      shadow: neutral.get(0)
    }
    Object.assign(roles, neutralRoles)
    return roles as ColorSchemeRoles<T>
  }
}
