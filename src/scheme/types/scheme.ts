import type { NeutralColorRoles } from './role.js'
import { Palette } from '../../palette/index.js'
import type { InherentColorKeys } from '../types.js'
import type { ColorTag } from '../../types.js'

/**
 * 调色板提取颜色规则
 */
export type PaletteExtractionColorRules = {
  /** 亮度和饱和度调整 */
  source: number
  /** 阴影色 */
  sourceShadow: number
  /** 悬停状态下的主色 */
  sourceHover: number
  /** 激活状态下的主色 */
  sourceActive: number
  /** 禁用状态下的主色 */
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

/**
 * 配色方案键
 *
 * - `main`: 主要颜色
 * - `aux`: 辅助颜色
 * - `extra`: 额外的颜色
 * - `success`: 成功颜色
 * - `warning`: 警告颜色
 * - `error`: 危险颜色
 * - `neutral`: 中性颜色
 */
export type ColorSchemeBaseKeys =
  | 'main'
  | 'aux'
  | 'extra'
  | 'success'
  | 'warning'
  | 'error'
  | 'neutral'
