import type { AnyColor, ColorTag, ColorTagToColorType, DeepPartial, HSLObject } from '../types.js'
import {
  adjustForContrast,
  anyColorToHslObject,
  anyColorToTargetColor,
  capitalize,
  type ComputeFormula,
  HslFormula,
  type Hues
} from '../utils/index.js'
import { Palette } from '../palette/index.js'
import type {
  ColorSchemePalettes,
  ColorSchemeRoles,
  NeutralColorRoles,
  PaletteExtractionColorRules
} from './types/index.js'
import type {
  BaseColorScheme,
  BaseSchemeOptions,
  BrightnessScheme,
  ColorSchemeTonal,
  SchemeOptions,
  Tone
} from './types.js'

/**
 * 配色方案
 *
 * @template OutColorTag - 调色板输出的颜色标签
 * @template CustomKeys - 自定义颜色键
 */
export class Scheme<OutColorTag extends ColorTag = 'hex', CustomKeys extends string = never> {
  /**
   * 暗色模式调色板取色规则
   */
  static readonly darkRoleRule: PaletteExtractionColorRules = {
    source: 70,
    onSource: 10,
    sourceShadow: 30,
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
      shadow: 30,
      scrim: 0,
      background: 6,
      onBackground: 90
    }
  }
  /**
   * 亮色模式调色板取色规则
   */
  static readonly lightRoleRule: PaletteExtractionColorRules = {
    source: 44,
    sourceShadow: 10,
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
      shadow: 10,
      scrim: 0,
      background: 98,
      onBackground: 10
    }
  }
  /**
   * 主调色板
   *
   * 所有的颜色角色都是通过此调色板取色！
   */
  public readonly palettes: ColorSchemePalettes<CustomKeys, OutColorTag>
  /**
   * 色调调色板
   */
  public readonly tonalPalettes: ColorSchemePalettes<CustomKeys, OutColorTag>
  /**
   * 亮度配色方案
   */
  public readonly bright: BrightnessScheme<CustomKeys, OutColorTag>
  /**
   * 基准配色
   */
  public readonly colors: BaseColorScheme<CustomKeys, OutColorTag>

  /**
   * 配色方案构造函数
   *
   * @param mainColor - 主色
   * @param {SchemeOptions} [options] - 配置选项
   * @param {Object} [options.darkRoleRule=Scheme.darkRoleRule] - 暗色模式调色板取色规则
   * @param {Object} [options.lightRoleRule=Scheme.lightRoleRule] - 亮色模式调色板取色规则
   * @param {Object} [options.customColorScheme] - 自定义颜色方案
   * @param {string} [options.outType] - 调试板要使用的目标类型
   */
  constructor(mainColor: AnyColor, options?: SchemeOptions<OutColorTag, CustomKeys>) {
    const { darkRoleRule, lightRoleRule, ...rest } = options || {}
    // 创建基本配色方案
    this.colors = Scheme.createBaseColorScheme(mainColor, rest)
    this.palettes = Scheme.colorSchemeToPalettes(this.colors)
    this.tonalPalettes = Scheme.colorSchemeToTonalPalettes(this.colors)

    // 深度合并自定义规则和默认规则
    const mergedDarkRule = Scheme.deepMergeRules(Scheme.darkRoleRule, darkRoleRule)
    const mergedLightRule = Scheme.deepMergeRules(Scheme.lightRoleRule, lightRoleRule)

    this.bright = {
      light: {
        roles: Scheme.createColorSchemeRoles(this.palettes, mergedLightRule),
        tonal: Scheme.createColorSchemeTonal(this.tonalPalettes, 'light')
      },
      dark: {
        roles: Scheme.createColorSchemeRoles(this.palettes, mergedDarkRule),
        tonal: Scheme.createColorSchemeTonal(this.tonalPalettes, 'dark')
      }
    }
  }

  /**
   * 深度合并规则
   *
   * @template T - 对象类型
   * @param {T} defaultRules - 默认的规则
   * @param {DeepPartial<T>} custom - 自定义的规则
   * @returns {T} - 合并后的对象
   */
  private static deepMergeRules<T extends Record<string, any>>(
    defaultRules: T,
    custom?: DeepPartial<T>
  ): T {
    if (!custom) return defaultRules
    const result = JSON.parse(JSON.stringify(defaultRules))
    for (const key in custom) {
      const value = custom[key]
      if (value && typeof value === 'object' && !Array.isArray(value)) {
        result[key] = this.deepMergeRules(defaultRules[key], value)
      } else if (value !== undefined) {
        result[key] = value as T[typeof key]
      }
    }
    return result
  }
  /**
   * 获取主题配色方案
   */
  get light() {
    return this.bright.light
  }

  /**
   * 获取暗黑主题配色方案
   */
  get dark() {
    return this.bright.dark
  }
  /**
   * 获取浅色模式下的颜色角色
   */
  get lightRoles() {
    return this.bright.light.roles
  }

  /**
   * 获取深色模式下的颜色角色
   */
  get darkRoles() {
    return this.bright.dark.roles
  }

  /**
   * 获取浅色模式下的色调
   */
  get lightTonal() {
    return this.bright.light.tonal
  }

  /**
   * 获取深色模式下的色调
   */
  get darkTonal() {
    return this.bright.dark.tonal
  }

  /**
   * 根据主色创建基准颜色配色方案
   *
   * @template T - 颜色类型
   * @param {AnyColor} mainColor - 主色
   * @param options
   * @returns {BaseColorScheme<T>} - 基准颜色配色方案
   */
  static createBaseColorScheme<
    OutColorTag extends ColorTag = 'hex',
    CustomKeys extends string = never
  >(
    mainColor: AnyColor,
    options?: BaseSchemeOptions<OutColorTag, CustomKeys>
  ): BaseColorScheme<CustomKeys, OutColorTag> {
    const { angle, formula = 'triadic', outType = 'hex', customColor = {} } = options ?? {}
    const colorScheme = customColor as BaseColorScheme<CustomKeys, 'HSL'>
    for (const colorSchemeKey in colorScheme) {
      const color = colorScheme[colorSchemeKey as CustomKeys]
      colorScheme[colorSchemeKey as CustomKeys] = anyColorToHslObject(color)
    }
    // 获取主色的 HSL 对象
    const primaryHsl = colorScheme.main || anyColorToHslObject(mainColor)
    // 获取调整后的 HSL 值
    const { h, s, l } = primaryHsl

    // 三分色 triadic
    // 正负相连色 adjacent
    // 分裂互补 splitComplementary
    // 计算功能色色相值
    const successHue = colorScheme.success?.h || HslFormula.smartFunctionalHue('success', h)
    const warningHue = colorScheme.warning?.h || HslFormula.smartFunctionalHue('warning', h)
    const errorHue = colorScheme.error?.h || HslFormula.smartFunctionalHue('error', h)

    // 创建辅色和三级色
    const auxHsl = { h: colorScheme.aux?.h, s, l } as HSLObject
    const extraHsl = { h: colorScheme.extra?.h, s, l } as HSLObject
    if (!auxHsl.h || !extraHsl.h) {
      const splitCompHues = this.computeAuxAndExtra(h, formula, angle, [
        successHue,
        warningHue,
        errorHue
      ])
      auxHsl.h ??= splitCompHues[1]
      extraHsl.h ??= splitCompHues[2]
    }

    // 应用功能色
    const successHsl = colorScheme.success || { h: successHue, s, l } // 动态绿色范围
    const warningHsl = colorScheme.warning || { h: warningHue, s, l } // 动态黄色范围
    const errorHsl = colorScheme.error || { h: errorHue, s, l } // 动态红色范围

    // 生成中性色：灰色调带有主色调
    const neutralHsl = { h, s: 0.15, l } // 灰色带有主色调的HSL

    // 合并配色方案
    Object.assign(colorScheme, {
      main: primaryHsl,
      aux: auxHsl,
      extra: extraHsl,
      success: successHsl,
      warning: warningHsl,
      error: errorHsl,
      neutral: neutralHsl
    })

    if (outType !== 'HSL') {
      // 将 HSL 配色方案转换为目标类型
      for (const hslSchemeKey in colorScheme) {
        // 应用感知均匀性调整
        const hsl = HslFormula.perceptuallyUniform(
          colorScheme[hslSchemeKey as keyof typeof colorScheme]
        )
        colorScheme[hslSchemeKey as keyof typeof colorScheme] = anyColorToTargetColor(
          hsl,
          outType
        ) as any
      }
    }

    return colorScheme as BaseColorScheme<CustomKeys, OutColorTag>
  }

  /**
   * 计算辅色和三级辅色
   *
   * @param hue - 主色色相
   * @param formula - 计算模式
   * @param angle - 色相偏移角度
   * @param functionalHues - 功能色色相
   * @returns {Hues} - 辅色和三级辅色
   * @private
   */
  private static computeAuxAndExtra(
    hue: number,
    formula: ComputeFormula,
    angle: number | undefined,
    functionalHues: number[]
  ): Hues {
    // 检查色相距离的辅助函数
    const checkHueDistance = (hue1: number, hue2: number): number => {
      const dist1 = Math.abs(hue1 - hue2)
      const dist2 = 360 - dist1
      return Math.min(dist1, dist2)
    }

    // 检查一组色相是否与功能色冲突
    const hasColorConflict = (hues: number[]): boolean => {
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
    let adjustedAngle = angle || (formula === 'triadic' ? 60 : formula === 'adjacent' ? 45 : 30)
    let splitCompHues: Hues
    let attempts = 0
    const maxAttempts = 3

    do {
      splitCompHues = HslFormula.computeHues(formula, hue, adjustedAngle)
      if (!hasColorConflict(splitCompHues)) break
      // 增加角度以尝试避免冲突
      adjustedAngle = adjustedAngle + 30
      attempts++
    } while (attempts < maxAttempts)
    return splitCompHues
  }

  /**
   * 基准配色方案调色板
   *
   * @template T - 配色方案类型
   * @param {T} colors - 配色方案
   * @returns {ColorSchemePalettes<T>} 配色方案的调色板，色阶范围0-100
   */
  static colorSchemeToPalettes<CustomKeys extends string, OutColorTag extends ColorTag>(
    colors: BaseColorScheme<CustomKeys, OutColorTag>
  ): ColorSchemePalettes<CustomKeys, OutColorTag> {
    return Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [key, Palette.create(value, 101)])
    ) as unknown as ColorSchemePalettes<CustomKeys, OutColorTag>
  }

  /**
   * 将颜色方案转换为简单的调试板
   *
   * @template T - 配色方案类型
   * @param {T} colors - 配色方案
   * @returns {ColorSchemePalettes<T>} 配色方案的调色板，色阶范围0-9
   */
  static colorSchemeToTonalPalettes<OutColorTag extends ColorTag, CustomKeys extends string>(
    colors: BaseColorScheme<CustomKeys, OutColorTag>
  ): ColorSchemePalettes<CustomKeys, OutColorTag> {
    return Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [
        key,
        Palette.create(value, 10, { min: 0.1, max: 0.9 })
      ])
    ) as unknown as ColorSchemePalettes<CustomKeys, OutColorTag>
  }

  /**
   * 创建角色配色方案
   *
   * @template T - BaseColorScheme
   * @param {ColorSchemePalettes<T>} palettes - 基准配色调色板
   * @param {PaletteExtractionColorRules} rules - 配色方案提取规则，可以通过 `Scheme.darkRoleRule|lightRoleRule` 获取默认的规则，也可以自定义规则
   * @param rules
   */
  static createColorSchemeRoles<CustomKeys extends string, OutColorTag extends ColorTag>(
    palettes: ColorSchemePalettes<CustomKeys, OutColorTag>,
    rules: PaletteExtractionColorRules
  ): ColorSchemeRoles<CustomKeys, OutColorTag> {
    const roles: Record<string, any> = {}
    for (const [key, palette] of Object.entries(palettes)) {
      // 跳过中性色，中性色由surface代替
      if (key === 'neutral') continue
      const onKey = `on${capitalize(key)}`

      roles[key] = palette.get(rules.source)
      roles[onKey] = adjustForContrast(palette.get(rules.onSource), roles[key])

      const hoverKey = `${key}Hover`
      roles[hoverKey] = palette.get(rules.sourceHover)
      roles[`${onKey}Hover`] = adjustForContrast(palette.get(rules.onSourceHover), roles[hoverKey])

      const activeKey = `${key}Active`
      roles[activeKey] = palette.get(rules.sourceActive)
      roles[`${onKey}Active`] = adjustForContrast(
        palette.get(rules.onSourceActive),
        roles[activeKey]
      )

      const disabledKey = `${key}Disabled`
      roles[disabledKey] = palette.get(rules.sourceDisabled)
      roles[`${onKey}Disabled`] = adjustForContrast(
        palette.get(rules.onSourceDisabled),
        roles[disabledKey]
      )

      const containerKey = `${key}Container`
      roles[containerKey] = palette.get(rules.container)
      roles[`${onKey}Container`] = adjustForContrast(
        palette.get(rules.onContainer),
        roles[containerKey]
      )
    }
    const palette = palettes.neutral
    const baseRoles = {} as NeutralColorRoles<ColorTagToColorType<OutColorTag>>
    for (const [key, value] of Object.entries(rules.base)) {
      baseRoles[key as keyof NeutralColorRoles<ColorTagToColorType<OutColorTag>>] =
        palette.get(value)
    }
    Object.assign(roles, baseRoles)
    return roles as ColorSchemeRoles<CustomKeys, OutColorTag>
  }

  /**
   * 创建色调配色方案
   *
   * @param {Object} palettes - 调色板
   * @param {string} mode - 主题模式
   */
  static createColorSchemeTonal<CustomKeys extends string, OutColorTag extends ColorTag>(
    palettes: ColorSchemePalettes<CustomKeys, OutColorTag>,
    mode: 'light' | 'dark'
  ): ColorSchemeTonal<CustomKeys, OutColorTag> {
    const toneIndex: Tone[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
    const tonal = {} as ColorSchemeTonal<CustomKeys, OutColorTag>
    for (const [key, palette] of Object.entries(palettes)) {
      const colors = mode === 'light' ? palette.all().reverse() : palette.all()
      for (const index of toneIndex) {
        tonal[`${key as CustomKeys}-${index}`] = colors[index - 1]
      }
    }
    return tonal
  }
}
