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
  adjustForContrast,
  anyColorToHslObject,
  anyColorToTargetColor,
  capitalize,
  type ComputeFormula,
  getColorType,
  HslFormula
} from '../utils/index.js'
import { Palette } from '../palette/index.js'

/**
 * 配色方案
 *
 * @template T - 颜色类型
 * @param {ColorScheme<T>} colors - 配色方案
 */
export default class Scheme<T extends AnyColor> {
  /**
   * 暗色模式调色板取色规则
   */
  static readonly darkRoleRule: PaletteExtractionColorRules = {
    source: 70,
    onSource: 10,
    sourceHover: 80,
    onSourceHover: 20,
    sourceActive: 64,
    onSourceActive: 10,
    sourceDisabled: 26,
    onSourceDisabled: 70,
    container: 30,
    onContainer: 90,
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
    source: 44,
    onSource: 100,
    sourceHover: 60,
    onSourceHover: 100,
    sourceActive: 40,
    onSourceActive: 98,
    sourceDisabled: 36,
    onSourceDisabled: 96,
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

  /**
   * 配色方案构造函数
   *
   * @param {ColorScheme<T>} colors - 基准配色方
   */
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
   * 根据主色创建基准颜色配色方案
   *
   * @template T - 颜色类型
   * @param {AnyColor} mainColor - 主色
   * @param {ComputeFormula} mode - 颜色模式
   * @param {number} [angle] - 色相角度
   * @returns {ColorScheme<T>} - 基准颜色配色方案
   */
  static createBaseColorScheme<T extends AnyColor>(
    mainColor: T,
    mode: ComputeFormula = 'triadic',
    angle?: number
  ): ColorScheme<ColorToColorType<T>> {
    const outType = getColorType(mainColor)
    // 获取主色的 HSL 对象
    const primaryHsl = anyColorToHslObject(mainColor, outType)
    // 应用感知均匀性调整
    const adjustedPrimaryHsl = HslFormula.perceptuallyUniform(
      primaryHsl.h,
      primaryHsl.s,
      primaryHsl.l
    )
    // 获取调整后的 HSL 值
    const { h, s, l } = adjustedPrimaryHsl

    // 三分色 triadic
    // 正负相连色 adjacent
    // 分裂互补 splitComplementary
    // 计算功能色色相值
    const successHue = HslFormula.smartFunctionalHue('success', h)
    const warningHue = HslFormula.smartFunctionalHue('warning', h)
    const errorHue = HslFormula.smartFunctionalHue('error', h)

    // 检查色相距离的辅助函数
    const checkHueDistance = (hue1: number, hue2: number): number => {
      const dist1 = Math.abs(hue1 - hue2)
      const dist2 = 360 - dist1
      return Math.min(dist1, dist2)
    }

    // 检查一组色相是否与功能色冲突
    const hasColorConflict = (hues: number[]): boolean => {
      const functionalHues = [successHue, warningHue, errorHue]
      for (const hue of hues) {
        for (const funcHue of functionalHues) {
          if (checkHueDistance(hue, funcHue) < 30) {
            return true
          }
        }
      }
      return false
    }

    // 根据色相冲突调整angle参数
    let adjustedAngle = angle || (mode === 'triadic' ? 60 : mode === 'adjacent' ? 45 : 30)
    let splitCompHues: number[]
    let attempts = 0
    const maxAttempts = 3

    do {
      splitCompHues = HslFormula.computeHues(mode, h, adjustedAngle)
      if (!hasColorConflict(splitCompHues)) break
      // 增加角度以尝试避免冲突
      adjustedAngle = adjustedAngle + 30
      attempts++
    } while (attempts < maxAttempts)

    const auxHue = splitCompHues[1]
    const extraHue = splitCompHues[2]

    // 确保辅色和三级辅色的饱和度低于主色，并应用感知均匀性调整
    const auxHsl = HslFormula.perceptuallyUniform(auxHue, s, l)
    const extraHsl = HslFormula.perceptuallyUniform(extraHue, s, l)

    // 应用功能色
    const successHsl = HslFormula.perceptuallyUniform(successHue, s, l) // 动态绿色范围
    const warningHsl = HslFormula.perceptuallyUniform(warningHue, s, l) // 动态黄色范围
    const errorHsl = HslFormula.perceptuallyUniform(errorHue, s, l) // 动态红色范围

    // 生成中性色：灰色调带有主色调，并应用感知均匀性调整
    const neutralHsl = { h, s: 0.15, l } // 灰色带有主色调的HSL

    // 创建 HSL 配色方案
    const hslScheme: ColorScheme<HSLObject> = {
      main: primaryHsl,
      aux: auxHsl,
      extra: extraHsl,
      success: successHsl,
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
      const onKey = `on${capitalize(key)}`

      roles[key] = palette.get(rule.source)
      roles[onKey] = adjustForContrast(palette.get(rule.onSource), roles[key])

      const hoverKey = `${key}Hover`
      roles[hoverKey] = palette.get(rule.sourceHover)
      roles[`${onKey}Hover`] = adjustForContrast(palette.get(rule.onSourceHover), roles[hoverKey])

      const activeKey = `${key}Active`
      roles[activeKey] = palette.get(rule.sourceActive)
      roles[`${onKey}Active`] = adjustForContrast(
        palette.get(rule.onSourceActive),
        roles[activeKey]
      )

      const disabledKey = `${key}Disabled`
      roles[disabledKey] = palette.get(rule.sourceDisabled)
      roles[`${onKey}Disabled`] = adjustForContrast(
        palette.get(rule.onSourceDisabled),
        roles[disabledKey]
      )

      const containerKey = `${key}Container`
      roles[containerKey] = palette.get(rule.container)
      roles[`${onKey}Container`] = adjustForContrast(
        palette.get(rule.onContainer),
        roles[containerKey]
      )
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
