import type { HSLObject } from '../types.js'

type Hues = [number, number, number]
/**
 * 计算公式：
 * - triadic：三分色，默认偏移为60度
 * - adjacent：相邻色，默认偏移为±45度
 * - complementary：分裂互补色，默认偏移为30度
 */
export type ComputeFormula = 'triadic' | 'adjacent' | 'complementary'

/**
 * HSL颜色公式
 */
export class HslFormula {
  /**
   * 计算相邻色相
   *
   * @param { number } hue - 色相值
   * @param { number } offset - 色相偏移量
   * @returns { number } - 相邻色相值
   */
  static adjacentHue(hue: number, offset: number): number {
    return (((hue + offset) % 360) + 360) % 360 // 确保色相值在 [0, 360) 范围内
  }

  /**
   * 计算互补色相
   *
   * 等同于`adjacentHue(hue, 180)`
   *
   * @param { number } hue - 色相
   * @returns { number } - 互补色相值
   */
  static complementaryHue(hue: number): number {
    return this.adjacentHue(hue, 180)
  }

  /**
   * 计算邻近色相
   *
   * 基于正负45度偏移生成邻近色相，这种方法在实际应用中通常比固定比例的算法更美观
   *
   * @param { number } hue - 基准色相
   * @param { number } [angle=45] - 偏移角度，默认45度
   * @returns { Hues } - 邻近色相数组，包括基准色相
   */
  static adjacentHues(hue: number, angle: number = 45): Hues {
    return [hue, this.adjacentHue(hue, -angle), this.adjacentHue(hue, angle)]
  }

  /**
   * 计算三分色相
   *
   * 默认使用较小的偏移角度(90度) 而非传统的三等分色环(120度)，
   * 这在实际应用中通常产生更和谐的配色
   *
   * @param { number } hue - 基准色相
   * @param { number } [angle=90] - 偏移角度，默认90度
   * @returns { Hues } - 三分色相数组，包括基准色相
   */
  static triadicHues(hue: number, angle: number = 60): Hues {
    return [hue, this.adjacentHue(hue, angle), this.adjacentHue(hue, angle * 2)]
  }

  /**
   * 计算分裂互补色相
   *
   * @param { number } hue - 基准色相
   * @param { number } [angle=30] - 分裂角度，默认30度
   * @returns { number[] } - 分裂互补色相数组，包括基准色相
   */
  static splitComplementaryHues(hue: number, angle: number = 30): Hues {
    const complement = this.complementaryHue(hue)
    return [hue, this.adjacentHue(complement, -angle), this.adjacentHue(complement, angle)]
  }

  /**
   * 根据主色计算出辅色和次要色
   *
   * @param mode - 计算模式
   * @param hue - 主色相
   * @param angle - 起始角度
   * @returns { Hues } - 计算后的色相数组
   */
  static computeHues(mode: ComputeFormula, hue: number, angle?: number): Hues {
    switch (mode) {
      case 'triadic':
        return this.triadicHues(hue, angle)
      case 'adjacent':
        return this.adjacentHues(hue, angle)
      default:
        return this.splitComplementaryHues(hue, angle)
    }
  }

  /**
   * 按比例调整饱和度或亮度
   *
   * @param { number } value - 原始值
   * @param { number } ratio - 调整比例[0, 1]
   * @returns { number } - 调整后的值
   */
  static ratioAdjust(value: number, ratio: number): number {
    return parseFloat(Math.max(0, Math.min(1, value * ratio)).toFixed(2))
  }

  /**
   * 根据色相动态调整饱和度
   *
   * 不同色相在相同饱和度下感知强度不同，此函数根据色相动态调整饱和度
   * 更精细的色相区间划分和调整系数，以获得更美观的配色效果
   *
   * @param { number } hue - 色相值
   * @param { number } saturation - 原始饱和度
   * @returns { number } - 调整后的饱和度
   */
  static dynamicSaturation(hue: number, saturation: number): number {
    // 初始因子
    let factor: number

    // 更精细的色相区间划分和调整
    if (hue >= 20 && hue < 60) {
      // 黄色区域感知饱和度较高，需要较大幅度降低饱和度
      factor = 0.8
    } else if (hue >= 60 && hue < 90) {
      // 黄绿过渡区域，适度降低饱和度
      factor = 0.85
    } else if (hue >= 90 && hue < 150) {
      // 绿色区域，轻微降低饱和度
      factor = 0.92
    } else if (hue >= 150 && hue < 210) {
      // 青色到蓝色过渡区域，基本保持原饱和度
      factor = 1.0
    } else if (hue >= 210 && hue < 270) {
      // 蓝色区域感知饱和度较低，需要提高饱和度
      factor = 1.15
    } else if (hue >= 270 && hue < 320) {
      // 紫色区域，轻微提高饱和度
      factor = 1.08
    } else {
      // 红色到品红区域，轻微降低饱和度
      factor = 0.95
    }

    return this.ratioAdjust(saturation, factor)
  }

  /**
   * 智能功能色相计算
   *
   * 根据主色调智能计算功能色的色相值，考虑色彩和谐性和色彩心理学
   *
   * @param { string } type - 功能色类型: 'success', 'warning', 'error'
   * @param { number } primaryHue - 主色调色相值
   * @returns { number } - 计算后的功能色色相值
   */
  static smartFunctionalHue(type: 'success' | 'warning' | 'error', primaryHue: number): number {
    // 基础功能色色相值范围
    const baseHues = {
      success: { min: 85, max: 110, default: 95 }, // 绿色范围
      warning: { min: 25, max: 45, default: 35 }, // 黄色范围
      error: { min: 355, max: 10, default: 0 } // 红色范围
    }

    const range = baseHues[type]

    // 检查主色是否与功能色色相接近，如果接近则适当调整以增加区分度
    let adjustedHue = range.default

    // 处理红色特殊情况（跨越0度）
    const compareHue = (h1: number, h2: number): number => {
      // 计算最短距离（考虑色环）
      const dist1 = Math.abs(h1 - h2)
      const dist2 = 360 - dist1
      return Math.min(dist1, dist2)
    }

    // 计算主色与默认功能色的色相距离
    const distance = compareHue(primaryHue, range.default)

    // 如果主色与功能色色相距离过近（小于30度），则调整功能色
    if (distance < 30) {
      // 根据主色位置决定调整方向
      if (type === 'error') {
        // 错误色特殊处理（跨越0度）
        if (primaryHue > 180) {
          // 主色在色环右侧，错误色向左调整
          adjustedHue = 5 // 偏红色
        } else {
          // 主色在色环左侧，错误色向右调整
          adjustedHue = 355 // 偏品红
        }
      } else {
        // 成功色和警告色的调整
        if (primaryHue > range.default) {
          // 主色在功能色右侧，功能色向左调整
          adjustedHue = range.min
        } else {
          // 主色在功能色左侧，功能色向右调整
          adjustedHue = range.max
        }
      }
    }

    return adjustedHue
  }

  /**
   * 感知均匀性调整
   *
   * 调整HSL颜色以获得更好的感知均匀性
   *
   * @param h - 色相
   * @param s - 饱和度
   * @param l - 亮度
   */
  static perceptuallyUniform(h: number, s: number, l: number): HSLObject {
    // 调整亮度以获得更好的感知均匀性
    // 中间亮度区域(0.4-0.6)需要更精细的调整
    // 动态调整饱和度
    s = this.dynamicSaturation(h, s)

    // 亮度感知调整
    if (l > 0.4 && l < 0.6) {
      // 中间亮度区域使用更精细的调整
      l = 0.5 + (l - 0.5) * 0.8
    } else if (l <= 0.4) {
      // 暗色区域压缩亮度范围，避免过暗
      l = 0.1 + l * 0.75
    } else {
      // 亮色区域压缩亮度范围，避免过亮
      l = 0.6 + (l - 0.6) * 0.8
    }

    return { h, s, l }
  }
}
