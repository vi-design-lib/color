import type { HexColor, RgbColor, RGBObject } from '../types.js'
import { colorToRgbObj } from './conversion.js'

/**
 * 将RGB颜色值转换为标准化颜色值
 * @param r 红色分量
 * @param g 绿色分量
 * @param b 蓝色分量
 * @returns {RGBObject} 返回包含标准化后的RGB颜色值的对象
 */
function rgbToNormalized(r: number, g: number, b: number): RGBObject {
  // 将颜色分量转换为标准化值的内部函数
  const normalize = (c: number) => {
    const normalized = c / 255
    return normalized <= 0.03928 ? normalized / 12.92 : Math.pow((normalized + 0.055) / 1.055, 2.4)
  }
  return {
    r: normalize(r),
    g: normalize(g),
    b: normalize(b)
  }
}

/**
 * 计算RGB颜色的相对亮度
 *
 * @param r 红色分量
 * @param g 绿色分量
 * @param b 蓝色分量
 * @returns {number} 返回相对亮度值
 */
function relativeLuminance(r: number, g: number, b: number): number {
  const { r: rNorm, g: gNorm, b: bNorm } = rgbToNormalized(r, g, b)
  return 0.2126 * rNorm + 0.7152 * gNorm + 0.0722 * bNorm
}

/**
 * 计算两种RGB颜色之间的对比度比率
 *
 * @param {RGBObject | HexColor | RgbColor} rgb1 第一种颜色的RGB值
 * @param {RGBObject | HexColor | RgbColor} rgb2 第二种颜色的RGB值
 * @returns {number} 返回对比度比率，结果四舍五入到小数点后两位
 */
export function contrastRatio(
  rgb1: RGBObject | HexColor | RgbColor,
  rgb2: RGBObject | HexColor | RgbColor
): number {
  if (typeof rgb1 === 'string') rgb1 = colorToRgbObj(rgb1)
  if (typeof rgb2 === 'string') rgb2 = colorToRgbObj(rgb2)
  const luminance1 = relativeLuminance(rgb1.r, rgb1.g, rgb1.b)
  const luminance2 = relativeLuminance(rgb2.r, rgb2.g, rgb2.b)
  const lighter = Math.max(luminance1, luminance2)
  const darker = Math.min(luminance1, luminance2)
  return parseFloat(((lighter + 0.05) / (darker + 0.05)).toFixed(2))
}
