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
   * @param { number } ratio - 调整比例[-1, 1]
   * @returns { number } - 调整后的值
   */
  static ratioAdjust(value: number, ratio: number): number {
    return Math.max(0, Math.min(1, value * ratio))
  }

  /**
   * 增加饱和度或亮度
   *
   * @param { number } value - 原始值
   * @param { number } inc - 增加量，负数表示减少
   */
  static incAdjust(value: number, inc: number): number {
    // 对于亮度和饱和度，直接根据比例增加或减少
    const adjustedValue = value + inc
    // 确保值在合法范围内
    return Math.max(0, Math.min(1, adjustedValue))
  }
}
