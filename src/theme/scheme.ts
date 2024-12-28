import type {
  AnyColor,
  ColorScheme,
  ColorSchemePalettes,
  ColorSchemeRoles,
  HSLObject,
  NeutralColorRoles,
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
    container: 30,
    onContainer: 90,
    source: 80,
    onSource: 20
  }
  /**
   * 亮色模式调色板取色规则
   */
  static readonly lightRule: PaletteExtractionColorRules = {
    container: 90,
    onContainer: 10,
    source: 40,
    onSource: 100
  }

  /**
   * 根据主色创建基准颜色配色方案
   *
   * @template T - 颜色类型
   * @param {AnyColor} primary - 主色
   * @returns {ColorScheme<T>} - 基准颜色配色方案
   */
  static createBaseColorScheme<T extends AnyColor>(primary: T): ColorScheme<T> {
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

    // 生成辅色和三级辅色的色相
    const secondaryHue = HslFormula.adjacentHue(h, -30) // 基于主色的相邻色 反向偏移
    const tertiaryHue = HslFormula.adjacentHue(h, 30) // 基于主色的相邻色，正向偏移

    // 确保辅色和三级辅色的饱和度低于主色
    const secondaryHsl = {
      h: secondaryHue,
      s: HslFormula.ratioAdjust(s, 0.8),
      l: adjustedLightness
    }
    const tertiaryHsl = { h: tertiaryHue, s: HslFormula.ratioAdjust(s, 0.7), l: adjustedLightness }

    // 生成中性色：灰色调带有主色调
    const neutralHsl = { h, s: 0.1, l: l * 0.9 } // 灰色带有主色调的HSL

    // 创建 HSL 配色方案
    const hslScheme: ColorScheme<HSLObject> = {
      primary: primaryHsl,
      secondary: secondaryHsl,
      tertiary: tertiaryHsl,
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
    return hslScheme as unknown as ColorScheme<T>
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
      Object.entries(scheme).map(([key, value]) => [key, Palette.create(value, 100)])
    ) as ColorSchemePalettes<T>
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
      roles[`on${capitalize(key)}`] = palette.get(this.lightRule.onSource)
      roles[`${key}Container`] = palette.get(this.lightRule.container)
      roles[`on${capitalize(key)}Container`] = palette.get(this.lightRule.onContainer)
    }
    const neutral = palettes.neutral
    const neutralRoles: NeutralColorRoles<T> = {
      // 默认的背景颜色
      surface: neutral.get(98),
      // 反色表面容器颜色
      inverseSurface: neutral.get(20),
      // 反色表面容器颜色之上的文本颜色
      inverseOnSurface: neutral.get(95),
      // 表面最暗淡的颜色
      surfaceDim: neutral.get(87),
      // 最亮表面颜色
      surfaceBright: neutral.get(98),
      // 表面容器最低层的颜色
      surfaceContainerLowest: neutral.get(100),
      // 表面容器颜色
      surfaceContainer: neutral.get(96),
      // 低强调容器颜色
      surfaceContainerLow: neutral.get(94),
      // 高强调容器颜色
      surfaceContainerHigh: neutral.get(92),
      // 最高强调容器颜色
      surfaceContainerHighest: neutral.get(90),
      // 背景之上的文本颜色
      onSurface: neutral.get(10),
      // 背景之上的文本颜色，低强调浅灰色
      onSurfaceVariant: neutral.get(30),
      // 通常用于描边，中性色
      outline: neutral.get(50),
      // 通常用于分割线，偏向于灰色
      outlineVariant: neutral.get(80),
      // 阴影颜色 通常需要降低透明度使用
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
      roles[`on${capitalize(key)}`] = palette.get(this.darkRule.onSource)
      roles[`${key}Container`] = palette.get(this.darkRule.container)
      roles[`on${capitalize(key)}Container`] = palette.get(this.darkRule.onContainer)
    }
    const neutral = palettes.neutral
    const neutralRoles: NeutralColorRoles<T> = {
      // 默认的背景颜色
      surface: neutral.get(6),
      // 反色表面容器颜色
      inverseSurface: neutral.get(90),
      // 反色表面容器颜色之上的文本颜色
      inverseOnSurface: neutral.get(20),
      // 表面最暗淡的颜色
      surfaceDim: neutral.get(6),
      // 最亮表面颜色
      surfaceBright: neutral.get(24),
      // 表面容器最低层的颜色
      surfaceContainerLowest: neutral.get(4),
      // 表面容器颜色
      surfaceContainer: neutral.get(12),
      // 低强调容器颜色
      surfaceContainerLow: neutral.get(10),
      // 高强调容器颜色
      surfaceContainerHigh: neutral.get(17),
      // 最高强调容器颜色
      surfaceContainerHighest: neutral.get(24),
      // 背景之上的文本颜色
      onSurface: neutral.get(90),
      // 背景之上的文本颜色，低强调浅灰色
      onSurfaceVariant: neutral.get(90),
      // 通常用于描边，中性色
      outline: neutral.get(60),
      // 通常用于分割线，偏向于灰色
      outlineVariant: neutral.get(30),
      // 阴影颜色 通常需要降低透明度使用
      shadow: neutral.get(0)
    }
    Object.assign(roles, neutralRoles)
    return roles as ColorSchemeRoles<T>
  }
}
