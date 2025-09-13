import type { RGBObject } from '../types.js'

/**
 * 表示带有评分的颜色对象
 * @interface ScoredColor
 * @property {RGBObject} color - RGB颜色对象
 * @property {number} score - 颜色的重要性评分
 * @property {number} [frequency] - 颜色在图像中出现的频率（可选）
 */
interface ScoredColor {
  color: RGBObject
  score: number
  frequency?: number
}

/**
 * 计算颜色的重要性分数并按重要性排序
 *
 * 基于以下因素：
 * 1. 颜色的饱和度和亮度 - 更鲜艳的颜色获得更高分数
 * 2. 颜色与其他颜色的差异性 - 更独特的颜色获得更高分数
 * 3. 颜色在图像中的使用频率 - 更常见的颜色获得更高分数
 *
 * @param {RGBObject[]} colors - 要评分的RGB颜色对象数组
 * @param {Map<string, number>} [frequencies] - 颜色频率映射，键为"r,g,b"格式的字符串，值为出现次数
 * @returns {RGBObject[]} 按重要性分数降序排列的颜色数组
 */
export function score(colors: RGBObject[], frequencies?: Map<string, number>): RGBObject[] {
  if (!colors.length) return []

  // 计算总频率，用于归一化
  let totalFrequency = 0
  if (frequencies) {
    for (const freq of frequencies.values()) {
      totalFrequency += freq
    }
  }

  const scoredColors: ScoredColor[] = colors.map((color) => {
    // 获取颜色频率
    let frequency = 0
    if (frequencies) {
      const key = `${color.r},${color.g},${color.b}`
      frequency = frequencies.get(key) || 0
    }

    return {
      color,
      frequency: totalFrequency > 0 ? frequency / totalFrequency : 0,
      score: calculateColorScore(color, totalFrequency > 0 ? frequency / totalFrequency : 0)
    }
  })

  // 按分数降序排序
  scoredColors.sort((a, b) => b.score - a.score)

  return scoredColors.map((sc) => sc.color)
}

/**
 * 计算单个颜色的分数
 *
 * 分数由以下因素决定：
 * 1. 饱和度 (0-1) - 饱和度越高，颜色越鲜艳
 * 2. 亮度 (0-1) - 中等亮度的颜色（约0.6）获得最高分
 * 3. 颜色纯度 - 与灰色的距离，纯度越高分数越高
 * 4. 颜色频率 (0-1) - 在图像中出现频率越高分数越高
 *
 * 最终分数是这些因素的加权和：
 * - 鲜艳度（饱和度结合亮度）：40%权重
 * - 亮度（偏好中等偏亮的颜色）：20%权重
 * - 纯度（与灰色的距离）：10%权重
 * - 频率（颜色出现频率）：30%权重
 *
 * @param {RGBObject} color - 要评分的RGB颜色对象
 * @param {number} [frequency=0] - 颜色在图像中出现的频率（0-1）
 * @returns {number} 颜色的重要性分数
 */
export function calculateColorScore(color: RGBObject, frequency: number = 0): number {
  const { r, g, b } = color

  // 计算饱和度 - 使用HSV/HSB模型中的饱和度计算方法
  // 饱和度 = (最大RGB值 - 最小RGB值) / 最大RGB值
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const chroma = max - min
  const saturation = max === 0 ? 0 : chroma / max

  // 计算亮度 - 使用感知亮度公式（考虑人眼对不同颜色的敏感度）
  // 亮度 = (0.299*R + 0.587*G + 0.114*B) / 255
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // 计算纯度 (与灰色的距离) - 衡量颜色与同亮度灰色的差异
  // 灰色 = RGB三通道的平均值
  // 纯度 = 颜色与对应灰色的欧几里得距离 / 最大可能距离
  const gray = (r + g + b) / 3
  const purity =
    Math.sqrt(Math.pow(r - gray, 2) + Math.pow(g - gray, 2) + Math.pow(b - gray, 2)) /
    Math.sqrt(195075) // 195075 是最大可能值 (255^2 * 3)

  // 鲜艳度评分 - 结合饱和度和亮度
  // 当亮度接近0.5时，鲜艳度最高；亮度过高或过低都会降低鲜艳度
  const vibrancy = saturation * (1 - Math.abs(luminance - 0.5) * 1.5)

  // 组合分数
  return (
    vibrancy * 0.4 + // 鲜艳度权重
    (1 - Math.abs(luminance - 0.6) * 2) * 0.2 + // 亮度权重（偏好较高亮度）
    purity * 0.1 + // 纯度权重
    frequency * 0.3 // 频率权重
  )
}
