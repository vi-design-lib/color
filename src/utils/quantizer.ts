import type { RGBObject } from '../types.js'

/**
 * 颜色盒子接口，表示RGB颜色空间中的一个立方体区域
 * @interface Box
 */
interface Box {
  r0: number
  r1: number
  g0: number
  g1: number
  b0: number
  b1: number
  vol: number
}

/**
 * 体积盒子接口，包含颜色盒子及其相关信息
 * @interface Vbox
 */
interface Vbox {
  vbox: Box
  color: RGBObject
  npix: number
  priority: number
}

/**
 * 每个颜色通道的有效位数
 */
const SIGBITS = 5
/**
 * 右移位数，用于降低颜色精度
 */
const RSHIFT = 8 - SIGBITS
/**
 * 直方图大小，基于SIGBITS计算
 */
const HISTSIZE = 1 << (3 * SIGBITS)
/**
 * 颜色盒子的长度
 */
const VBOX_LENGTH = 1 << SIGBITS
/**
 * 迭代次数上限
 */
const ITERATIONS = 15

/**
 * 计算颜色索引，将RGB值映射到一维数组索引
 * @param {number} r - 红色通道值（已量化）
 * @param {number} g - 绿色通道值（已量化）
 * @param {number} b - 蓝色通道值（已量化）
 * @returns {number} 一维数组中的索引值
 */
function getColorIndex(r: number, g: number, b: number): number {
  return (r << (2 * SIGBITS)) + (g << SIGBITS) + b
}

/**
 * 创建颜色直方图，统计每种颜色的出现频率
 * @param {RGBObject[]} pixels - RGB像素数组
 * @returns {number[]} 颜色直方图数组
 */
function createHistogram(pixels: RGBObject[]): number[] {
  const histogram = new Array(HISTSIZE).fill(0)
  pixels.forEach((pixel) => {
    const r = pixel.r >> RSHIFT
    const g = pixel.g >> RSHIFT
    const b = pixel.b >> RSHIFT
    const index = getColorIndex(r, g, b)
    histogram[index]++
  })
  return histogram
}

/**
 * 创建颜色盒子
 * @param {number} r0 - 红色通道最小值
 * @param {number} r1 - 红色通道最大值
 * @param {number} g0 - 绿色通道最小值
 * @param {number} g1 - 绿色通道最大值
 * @param {number} b0 - 蓝色通道最小值
 * @param {number} b1 - 蓝色通道最大值
 * @returns {Box} 创建的颜色盒子
 */
function createVbox(r0: number, r1: number, g0: number, g1: number, b0: number, b1: number): Box {
  return {
    r0,
    r1,
    g0,
    g1,
    b0,
    b1,
    vol: (r1 - r0 + 1) * (g1 - g0 + 1) * (b1 - b0 + 1)
  }
}

/**
 * 找出颜色盒子中最大的维度（红、绿或蓝）
 * @param {Box} vbox - 颜色盒子
 * @returns {{ volume: number; dimension: 'r' | 'g' | 'b' }} 最大维度及其体积
 */
function findBiggestVolume(vbox: Box): { volume: number; dimension: 'r' | 'g' | 'b' } {
  const rw = vbox.r1 - vbox.r0 + 1
  const gw = vbox.g1 - vbox.g0 + 1
  const bw = vbox.b1 - vbox.b0 + 1

  const maxw = Math.max(rw, gw, bw)

  if (maxw === rw) return { volume: rw, dimension: 'r' }
  if (maxw === gw) return { volume: gw, dimension: 'g' }
  return { volume: bw, dimension: 'b' }
}

/**
 * 应用中值切分算法（Median Cut）将颜色盒子分割成两个
 * 该算法在最长的维度上找到中值点进行切分
 * @param {number[]} histogram - 颜色直方图
 * @param {Box} vbox - 要分割的颜色盒子
 * @returns {Box | null} 分割后的新颜色盒子，如果无法分割则返回null
 */
function medianCutApply(histogram: number[], vbox: Box): Box | null {
  const { dimension } = findBiggestVolume(vbox)
  let total = 0
  const partialSum: number[] = []

  if (dimension === 'r') {
    for (let i = vbox.r0; i <= vbox.r1; i++) {
      let sum = 0
      for (let g = vbox.g0; g <= vbox.g1; g++) {
        for (let b = vbox.b0; b <= vbox.b1; b++) {
          const index = getColorIndex(i, g, b)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  } else if (dimension === 'g') {
    for (let i = vbox.g0; i <= vbox.g1; i++) {
      let sum = 0
      for (let r = vbox.r0; r <= vbox.r1; r++) {
        for (let b = vbox.b0; b <= vbox.b1; b++) {
          const index = getColorIndex(r, i, b)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  } else {
    for (let i = vbox.b0; i <= vbox.b1; i++) {
      let sum = 0
      for (let r = vbox.r0; r <= vbox.r1; r++) {
        for (let g = vbox.g0; g <= vbox.g1; g++) {
          const index = getColorIndex(r, g, i)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  }

  const halfTotal = total / 2
  let threshold

  for (let i = 0; i < partialSum.length; i++) {
    if (partialSum[i] >= halfTotal) {
      threshold = i
      break
    }
  }

  if (threshold === undefined) return null

  const newBox = { ...vbox }
  if (dimension === 'r') {
    newBox.r1 = threshold
    vbox.r0 = threshold + 1
  } else if (dimension === 'g') {
    newBox.g1 = threshold
    vbox.g0 = threshold + 1
  } else {
    newBox.b1 = threshold
    vbox.b0 = threshold + 1
  }

  newBox.vol =
    (newBox.r1 - newBox.r0 + 1) * (newBox.g1 - newBox.g0 + 1) * (newBox.b1 - newBox.b0 + 1)
  vbox.vol = (vbox.r1 - vbox.r0 + 1) * (vbox.g1 - vbox.g0 + 1) * (vbox.b1 - vbox.b0 + 1)

  return newBox
}

/**
 * 计算颜色盒子中的平均颜色
 * @param {number[]} histogram - 颜色直方图
 * @param {Box} vbox - 颜色盒子
 * @returns {RGBObject} 平均颜色的RGB对象
 */
function averageColor(histogram: number[], vbox: Box): RGBObject {
  let ntot = 0
  let mult = 1 << (8 - SIGBITS)
  let rsum = 0
  let gsum = 0
  let bsum = 0

  for (let r = vbox.r0; r <= vbox.r1; r++) {
    for (let g = vbox.g0; g <= vbox.g1; g++) {
      for (let b = vbox.b0; b <= vbox.b1; b++) {
        const index = getColorIndex(r, g, b)
        const count = histogram[index]
        ntot += count
        rsum += count * (r + 0.5) * mult
        gsum += count * (g + 0.5) * mult
        bsum += count * (b + 0.5) * mult
      }
    }
  }

  if (ntot) {
    return {
      r: Math.min(255, Math.round(rsum / ntot)),
      g: Math.min(255, Math.round(gsum / ntot)),
      b: Math.min(255, Math.round(bsum / ntot))
    }
  } else {
    return {
      r: Math.min(255, Math.round((mult * (vbox.r0 + vbox.r1 + 1)) / 2)),
      g: Math.min(255, Math.round((mult * (vbox.g0 + vbox.g1 + 1)) / 2)),
      b: Math.min(255, Math.round((mult * (vbox.b0 + vbox.b1 + 1)) / 2))
    }
  }
}

/**
 * 颜色量化算法，将输入的像素集合量化为指定数量的颜色
 * 使用中值切分（Median Cut）算法递归地将颜色空间分割为多个盒子
 * 然后从每个盒子中提取代表性颜色
 *
 * @param {RGBObject[]} pixels - 输入的RGB像素数组
 * @param {number} maxColors - 最大颜色数量，范围为2-256
 * @returns {RGBObject[]} 量化后的颜色数组
 */
export function quantize(pixels: RGBObject[], maxColors: number): RGBObject[] {
  if (!pixels.length || maxColors < 2 || maxColors > 256) {
    return []
  }

  const histogram = createHistogram(pixels)
  const vbox = createVbox(0, VBOX_LENGTH - 1, 0, VBOX_LENGTH - 1, 0, VBOX_LENGTH - 1)
  const colorMap: Vbox[] = [
    { vbox, color: averageColor(histogram, vbox), npix: pixels.length, priority: 0 }
  ]

  // 首次迭代
  for (let i = 0; i < ITERATIONS; i++) {
    const vbox = colorMap[0].vbox
    const newBox = medianCutApply(histogram, vbox)
    if (newBox) {
      colorMap[0].vbox = vbox
      colorMap[0].color = averageColor(histogram, vbox)
      colorMap[0].npix = pixels.length
      colorMap.push({
        vbox: newBox,
        color: averageColor(histogram, newBox),
        npix: pixels.length,
        priority: 0
      })
    }
    if (colorMap.length >= maxColors) break
  }

  // 按体积排序
  colorMap.sort((a, b) => b.vbox.vol - a.vbox.vol)

  return colorMap.map((vbox) => vbox.color)
}
