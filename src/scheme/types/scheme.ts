import type { ColorSchemeRoles, NeutralColorRoles } from './role.js'
import { Palette } from '../../palette/index.js'
import type { AnyColor, ColorTag, ColorTagToColorType, DeepPartial } from '../../types.js'
import type { ComputeFormula } from '../../utils/index.js'

/**
 * 调色板提取颜色规则
 */
export type PaletteExtractionColorRules = {
  /** 源色 */
  source: number
  /** 悬停状态下的源色 */
  sourceHover: number
  /** 激活状态下的源色 */
  sourceActive: number
  /** 禁用状态下的源色 */
  sourceDisabled: number
  /** 背景上的文本颜色 */
  onSource: number
  /** 悬停状态上的文本颜色 */
  onSourceHover: number
  /** 激活状态上的文本颜色 */
  onSourceActive: number
  /** 禁用状态上的文本颜色 */
  onSourceDisabled: number
  /** 容器背景 */
  container: number
  /** 容器上的文本颜色 */
  onContainer: number
  /** 中性色基准配色方案 */
  base: NeutralColorRoles<number>
}

/**
 * 配色方案调色板
 *
 * @template CustomKeys - 自定义颜色键
 * @template OutColorTag - 调色板输出的颜色标签
 */
export type ColorSchemePalettes<CustomKeys extends string, OutColorTag extends ColorTag> = Record<
  InherentColorKeys | CustomKeys,
  Palette<OutColorTag>
>

export interface BaseSchemeOptions<
  OutColorTag extends ColorTag = 'hex',
  CustomKeys extends string = never
> {
  /**
   * 自定义颜色
   *
   * 如果和固有配色方案重名，会覆盖固有配色方案
   */
  customColor?: Record<CustomKeys, AnyColor>
  /**
   * 输出的颜色目标类型
   */
  outType?: OutColorTag
  /**
   * 颜色计算公式
   *
   * @default 'triadic'
   */
  formula?: ComputeFormula
  /**
   * 色相起始角度
   */
  angle?: number
}

/**
 * 配色方案选项
 *
 * @template OutColorTag - 输出的颜色标签类型，默认为hex
 * @template CustomKeys - 自定义颜色键
 */
export interface SchemeOptions<
  OutColorTag extends ColorTag = 'hex',
  CustomKeys extends string = never
> extends BaseSchemeOptions<OutColorTag, CustomKeys> {
  /**
   * 暗色模式调色板取色规则
   *
   * 会和 {@linkcode Scheme.darkRoleRule} 进行深度合并
   *
   * @default Scheme.darkRoleRule
   */
  darkRoleRule?: DeepPartial<PaletteExtractionColorRules>
  /**
   * 亮色模式调色板取色规则
   *
   * 会和 {@linkcode Scheme.lightRoleRule} 进行深度合并
   *
   * @default Scheme.lightRoleRule
   */
  lightRoleRule?: DeepPartial<PaletteExtractionColorRules>
}

/**
 * 基准的配色方案键
 *
 * 基础颜色层级：
 * - `primary`: 主要颜色（一级颜色）
 * - `secondary`: 次要颜色（二级颜色）
 * - `tertiary`: 辅助颜色（三级颜色）
 *
 * 状态颜色：
 * - `success`: 成功颜色
 * - `warning`: 警告颜色
 * - `error`: 危险颜色
 *
 * 中性颜色：
 * - `neutral`: 中性颜色
 */
export type InherentColorKeys =
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'

/**
 * 色阶可选范围
 */
export type Tone = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10

/**
 * 色阶键
 */
export type TonalKeys<Keys extends string> = `${Keys | InherentColorKeys}-${Tone}`

/**
 * 色调调色板
 */
export type ColorSchemeTonal<KS extends string, OutColorTag extends ColorTag> = {
  [K in TonalKeys<KS>]: ColorTagToColorType<OutColorTag>
}

/**
 * 基准配色方案
 *
 * @template CustomKeys - 自定义颜色键
 * @template ColorTagType - 颜色标签类型
 */
export type BaseColorScheme<CustomKeys extends string, ColorTagType extends ColorTag> = Record<
  InherentColorKeys | CustomKeys,
  ColorTagToColorType<ColorTagType>
>

/**
 * 配色方案数据
 *
 * @template CustomKeys - 配色方案键
 * @template OutColorTag - 输出的颜色标签类型，默认为hex
 */
export interface ColorScheme<CustomKeys extends string, OutColorTag extends ColorTag> {
  /**
   * 角色配色方案
   */
  roles: ColorSchemeRoles<CustomKeys, OutColorTag>
  /**
   * 色调配色方案
   */
  tonal: ColorSchemeTonal<CustomKeys, OutColorTag>
}

/**
 * 亮度配色方案
 *
 * @template CustomKeys - 自定义颜色键
 * @template OutColorType - 输出的颜色类型，默认为hex
 */
export interface BrightnessScheme<CustomKeys extends string, OutColorTag extends ColorTag> {
  dark: ColorScheme<CustomKeys, OutColorTag>
  light: ColorScheme<CustomKeys, OutColorTag>
}
