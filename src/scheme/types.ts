import type { ColorSchemeRoles, PaletteExtractionColorRules } from './types/index.js'
import type { ComputeFormula } from '../utils/index.js'
import type { AnyColor, ColorTag, ColorTagToColorType, DeepPartial } from '../types.js'

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
   * 调试板要使用的目标类型
   */
  outType?: OutColorTag
  /**
   * 计算模式
   *
   * @default 'triadic'
   */
  formula?: ComputeFormula
  /**
   * 色相偏移角度
   *
   * - triadic：三分色，默认偏移为60度
   * - adjacent：相邻色，默认偏移为±45度
   * - complementary：分裂互补色，默认偏移为30度
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
 * - `main`: 主要颜色
 * - `aux`: 辅助颜色
 * - `extra`: 额外的颜色
 * - `success`: 成功颜色
 * - `warning`: 警告颜色
 * - `error`: 危险颜色
 * - `neutral`: 中性颜色
 */
export type InherentColorKeys =
  | 'main'
  | 'aux'
  | 'extra'
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
