import type { HSLObject } from '../types.js'

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
   * @returns { number } - 相邻颜色的HSL对象
   */
  static complementaryHue(hue: number): number {
    return this.adjacentHue(hue, 180)
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
   * 调整HSL颜色的亮度和饱和度
   *
   *
   * @param { HSLObject } color - 需要调整的HSL颜色对象
   * @param { number } saturationAdjust - 饱和度调整值，范围 -1 到 1，负值降低饱和度，正值增加饱和度
   * @param { number } lightnessAdjust - 亮度调整值，范围 -1 到 1，负值降低亮度，正值增加亮度
   * @returns { HSLObject } 新的HSL颜色对象
   */
  static adjustHSL(color: HSLObject, saturationAdjust: number, lightnessAdjust: number): HSLObject {
    // 饱和度调整：范围 [0, 1]
    let newS = color.s + saturationAdjust
    newS = Math.min(Math.max(newS, 0), 1) // 确保饱和度在 [0, 1] 范围内

    // 亮度调整：范围 [0, 1]
    let newL = color.l + lightnessAdjust
    newL = Math.min(Math.max(newL, 0), 1) // 确保亮度在 [0, 1] 范围内
    // 返回调整后的 HSL 对象
    return {
      h: color.h,
      s: newS,
      l: newL
    }
  }
}
