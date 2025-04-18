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
  BaseColorScheme,
  BaseSchemeOptions,
  BrightnessScheme,
  ColorScheme,
  ColorSchemePalettes,
  ColorSchemeRoles,
  ColorSchemeTonal,
  NeutralColorRoles,
  PaletteExtractionColorRules,
  SchemeOptions,
  Tone
} from './types/index.js'

/**
 * 配色方案类
 *
 * 用于创建和管理基于主色的完整配色系统，支持亮色和暗色模式。
 * 该类提供了一系列方法来生成协调的颜色方案，包括主色、辅助色、功能色和中性色。
 *
 * @template OutColorTag - 调色板输出的颜色标签类型，默认为'hex'
 * @template CustomKeys - 自定义颜色键类型，用于扩展基础配色方案
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
   * 根据提供的主色和配置选项创建一个完整的配色方案实例。
   * 构造过程会自动生成基准配色、调色板、色调调色板以及亮色/暗色模式下的角色配色。
   *
   * @param {AnyColor} mainColor - 主色，作为整个配色方案的基础
   * @param {SchemeOptions<OutColorTag, CustomKeys>} [options] - 配置选项
   * @param {DeepPartial<PaletteExtractionColorRules>} [options.darkRoleRule=Scheme.darkRoleRule] - 暗色模式调色板取色规则
   * @param {DeepPartial<PaletteExtractionColorRules>} [options.lightRoleRule=Scheme.lightRoleRule] - 亮色模式调色板取色规则
   * @param {Record<CustomKeys, AnyColor>} [options.customColor] - 自定义颜色配置
   * @param {OutColorTag} [options.outType='hex'] - 调色板输出的颜色类型
   * @param {ComputeFormula} [options.formula='triadic'] - 计算辅助色的公式
   * @param {number} [options.angle] - 色相偏移角度
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
   * 获取亮色主题配色方案
   *
   * @returns {ColorScheme<CustomKeys, OutColorTag>} 亮色模式下的配色方案
   */
  get light(): ColorScheme<CustomKeys, OutColorTag> {
    return this.bright.light
  }

  /**
   * 获取暗色主题配色方案
   *
   * @returns {ColorScheme<CustomKeys, OutColorTag>} 暗色模式下的配色方案
   */
  get dark(): ColorScheme<CustomKeys, OutColorTag> {
    return this.bright.dark
  }

  /**
   * 获取亮色模式下的颜色角色
   *
   * @returns {ColorSchemeRoles<CustomKeys, OutColorTag>} 亮色模式下的颜色角色配置
   */
  get lightRoles(): ColorSchemeRoles<CustomKeys, OutColorTag> {
    return this.bright.light.roles
  }

  /**
   * 获取暗色模式下的颜色角色
   *
   * @returns {ColorSchemeRoles<CustomKeys, OutColorTag>} 暗色模式下的颜色角色配置
   */
  get darkRoles(): ColorSchemeRoles<CustomKeys, OutColorTag> {
    return this.bright.dark.roles
  }

  /**
   * 获取亮色模式下的色调配色方案
   *
   * @returns {ColorSchemeTonal<CustomKeys, OutColorTag>} 亮色模式下的色调配色方案
   */
  get lightTonal(): ColorSchemeTonal<CustomKeys, OutColorTag> {
    return this.bright.light.tonal
  }

  /**
   * 获取暗色模式下的色调配色方案
   *
   * @returns {ColorSchemeTonal<CustomKeys, OutColorTag>} 暗色模式下的色调配色方案
   */
  get darkTonal(): ColorSchemeTonal<CustomKeys, OutColorTag> {
    return this.bright.dark.tonal
  }

  /**
   * 根据主色创建基准颜色配色方案
   *
   * 该方法根据提供的主色生成一套完整的基准配色方案，包括主色、辅助色、额外色和功能色。
   * 会根据主色自动计算协调的辅助色和功能色，也支持通过选项自定义各个颜色。
   *
   * @template OutColorTag - 输出的颜色标签类型，默认为'hex'
   * @template CustomKeys - 自定义颜色键类型
   * @param {AnyColor} mainColor - 主色，作为整个配色方案的基础
   * @param {BaseSchemeOptions<OutColorTag, CustomKeys>} [options] - 基准配色方案选项
   * @param {ComputeFormula} [options.formula='triadic'] - 计算辅助色的公式
   * @param {number} [options.angle] - 色相偏移角度
   * @param {OutColorTag} [options.outType='hex'] - 输出的颜色类型
   * @param {Record<CustomKeys, AnyColor>} [options.customColor] - 自定义颜色配置
   * @returns {BaseColorScheme<CustomKeys, OutColorTag>} 生成的基准颜色配色方案
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
   * 计算辅色和三级辅色的色相值
   *
   * 该方法根据主色色相、计算公式和偏移角度，计算出协调的辅色和三级辅色色相值。
   * 会自动检测并避免与功能色色相冲突，确保生成的配色方案协调美观。
   *
   * @param {number} hue - 主色色相值，范围0-360
   * @param {ComputeFormula} formula - 计算模式，可选值：'triadic'|'adjacent'|'splitComplementary'
   * @param {number} [angle] - 色相偏移角度，不同计算模式有不同的默认值
   * @param {number[]} functionalHues - 功能色色相值数组，用于检测色相冲突
   * @returns {Hues} 包含主色、辅色和三级辅色色相值的数组
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
   * 深度合并规则对象
   *
   * 将自定义规则与默认规则进行深度合并，支持嵌套对象的合并。
   * 如果自定义规则中的某个属性值为undefined，则使用默认规则中的对应值。
   *
   * @template T - 规则对象类型
   * @param {T} defaultRules - 默认的规则对象
   * @param {DeepPartial<T>} [custom] - 自定义的规则对象，可选
   * @returns {T} 合并后的规则对象
   * @private
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
   * 将基准配色方案转换为调色板集合
   *
   * 根据基准配色方案中的各个颜色，为每个颜色创建一个101级色阶的调色板。
   * 生成的调色板可用于提取不同亮度级别的颜色变体。
   *
   * @template CustomKeys - 自定义颜色键类型
   * @template OutColorTag - 输出的颜色标签类型
   * @param {BaseColorScheme<CustomKeys, OutColorTag>} colors - 基准配色方案
   * @returns {ColorSchemePalettes<CustomKeys, OutColorTag>} 配色方案的调色板集合，每个调色板包含101级色阶(0-100)
   */
  static colorSchemeToPalettes<CustomKeys extends string, OutColorTag extends ColorTag>(
    colors: BaseColorScheme<CustomKeys, OutColorTag>
  ): ColorSchemePalettes<CustomKeys, OutColorTag> {
    return Object.fromEntries(
      Object.entries(colors).map(([key, value]) => [key, Palette.create(value, 101)])
    ) as unknown as ColorSchemePalettes<CustomKeys, OutColorTag>
  }

  /**
   * 将基准配色方案转换为色调调色板集合
   *
   * 根据基准配色方案中的各个颜色，为每个颜色创建一个10级色阶的调色板。
   * 生成的色调调色板用于提供简化的色调变体，亮度范围限制在0.1-0.9之间。
   *
   * @template OutColorTag - 输出的颜色标签类型
   * @template CustomKeys - 自定义颜色键类型
   * @param {BaseColorScheme<CustomKeys, OutColorTag>} colors - 基准配色方案
   * @returns {ColorSchemePalettes<CustomKeys, OutColorTag>} 配色方案的色调调色板集合，每个调色板包含10级色阶(0-9)
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
   * 根据调色板集合和提取规则，为每个颜色创建一系列具有特定语义的角色颜色。
   * 包括基础颜色、悬停状态、激活状态、禁用状态以及容器颜色等。
   * 同时会自动调整对比度，确保文本在背景上的可读性。
   *
   * @template CustomKeys - 自定义颜色键类型
   * @template OutColorTag - 输出的颜色标签类型
   * @param {ColorSchemePalettes<CustomKeys, OutColorTag>} palettes - 基准配色调色板集合
   * @param {PaletteExtractionColorRules} rules - 配色方案提取规则，定义从调色板中提取各角色颜色的亮度级别
   * @returns {ColorSchemeRoles<CustomKeys, OutColorTag>} 生成的角色配色方案
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
   * 根据调色板集合和主题模式，创建一个包含所有颜色10个色调级别的配色方案。
   * 亮色模式下色调从浅到深排列，暗色模式下从深到浅排列。
   *
   * @template CustomKeys - 自定义颜色键类型
   * @template OutColorTag - 输出的颜色标签类型
   * @param {ColorSchemePalettes<CustomKeys, OutColorTag>} palettes - 色调调色板集合
   * @param {'light' | 'dark'} mode - 主题模式，'light' 表示亮色模式，'dark' 表示暗色模式
   * @returns {ColorSchemeTonal<CustomKeys, OutColorTag>} 生成的色调配色方案
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
