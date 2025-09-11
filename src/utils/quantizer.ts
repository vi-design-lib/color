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
  // 初始化一个长度为HISTSIZE的数组，所有元素填充为0
  const histogram = new Array(HISTSIZE).fill(0)
  // 遍历每个像素
  pixels.forEach((pixel) => {
    // 将RGB值右移RSHIFT位，用于颜色量化
    const r = pixel.r >> RSHIFT
    const g = pixel.g >> RSHIFT
    const b = pixel.b >> RSHIFT
    // 获取量化后的颜色在直方图中的索引
    const index = getColorIndex(r, g, b)
    // 增加对应索引处的计数
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
  // 返回一个包含RGB通道范围和体积的对象
  return {
    r0, // 红色通道最小值
    r1, // 红色通道最大值
    g0, // 绿色通道最小值
    g1, // 绿色通道最大值
    b0, // 蓝色通道最小值
    b1, // 蓝色通道最大值
    vol: (r1 - r0 + 1) * (g1 - g0 + 1) * (b1 - b0 + 1) // 计算颜色盒子的体积
  }
}

/**
 * 找出颜色盒子中最大的维度（红、绿或蓝）
 * @param {Box} vbox - 颜色盒子
 * @returns {{ volume: number; dimension: 'r' | 'g' | 'b' }} 最大维度及其体积
 */
function findBiggestVolume(vbox: Box): { volume: number; dimension: 'r' | 'g' | 'b' } {
  // 计算红色维度的宽度
  const rw = vbox.r1 - vbox.r0 + 1
  // 计算绿色维度的宽度
  const gw = vbox.g1 - vbox.g0 + 1
  // 计算蓝色维度的宽度
  const bw = vbox.b1 - vbox.b0 + 1

  // 找出三个维度中的最大宽度
  const maxw = Math.max(rw, gw, bw)

  // 如果红色维度最大，返回红色维度的宽度和标识符
  if (maxw === rw) return { volume: rw, dimension: 'r' }
  // 如果绿色维度最大，返回绿色维度的宽度和标识符
  if (maxw === gw) return { volume: gw, dimension: 'g' }
  // 默认返回蓝色维度的宽度和标识符（因为蓝色维度是唯一剩下的可能性）
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
  // 找到颜色盒子中体积最大的维度
  const { dimension } = findBiggestVolume(vbox)
  let total = 0
  const partialSum: number[] = []

  // 根据最大维度分别处理红、绿、蓝三个通道
  if (dimension === 'r') {
    // 红色通道处理
    for (let i = vbox.r0; i <= vbox.r1; i++) {
      let sum = 0
      // 遍历绿色通道
      for (let g = vbox.g0; g <= vbox.g1; g++) {
        // 遍历蓝色通道
        for (let b = vbox.b0; b <= vbox.b1; b++) {
          // 获取颜色索引并累加
          const index = getColorIndex(i, g, b)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  } else if (dimension === 'g') {
    // 绿色通道处理
    for (let i = vbox.g0; i <= vbox.g1; i++) {
      let sum = 0
      // 遍历红色通道
      for (let r = vbox.r0; r <= vbox.r1; r++) {
        // 遍历蓝色通道
        for (let b = vbox.b0; b <= vbox.b1; b++) {
          // 获取颜色索引并累加
          const index = getColorIndex(r, i, b)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  } else {
    // 蓝色通道处理
    for (let i = vbox.b0; i <= vbox.b1; i++) {
      let sum = 0
      // 遍历红色通道
      for (let r = vbox.r0; r <= vbox.r1; r++) {
        // 遍历绿色通道
        for (let g = vbox.g0; g <= vbox.g1; g++) {
          // 获取颜色索引并累加
          const index = getColorIndex(r, g, i)
          sum += histogram[index]
        }
      }
      total += sum
      partialSum[i] = total
    }
  }

  // 计算中值阈值
  const halfTotal = total / 2
  let threshold

  // 找到中值点
  for (let i = 0; i < partialSum.length; i++) {
    if (partialSum[i] >= halfTotal) {
      threshold = i
      break
    }
  }

  // 如果找不到阈值则返回null
  if (threshold === undefined) return null

  // 创建新的颜色盒子
  const newBox = { ...vbox }
  // 根据不同维度更新盒子边界
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

  // 计算并更新两个盒子的体积
  newBox.vol =
    (newBox.r1 - newBox.r0 + 1) * (newBox.g1 - newBox.g0 + 1) * (newBox.b1 - newBox.b0 + 1)
  vbox.vol = (vbox.r1 - vbox.r0 + 1) * (vbox.g1 - vbox.g0 + 1) * (vbox.b1 - vbox.b0 + 1)

  // 返回分割后的新盒子
  return newBox
}

/**
 * 计算颜色盒子中的平均颜色
 * @param {number[]} histogram - 颜色直方图
 * @param {Box} vbox - 颜色盒子
 * @returns {RGBObject} 平均颜色的RGB对象
 */
function averageColor(histogram: number[], vbox: Box): RGBObject {
  let ntot = 0 // 用于统计总像素数
  let mult = 1 << (8 - SIGBITS) // 计算乘数，用于将颜色值转换到0-255范围
  let rsum = 0 // 红色通道总和
  let gsum = 0 // 绿色通道总和
  let bsum = 0 // 蓝色通道总和

  // 遍历颜色盒子中的所有颜色值
  for (let r = vbox.r0; r <= vbox.r1; r++) {
    for (let g = vbox.g0; g <= vbox.g1; g++) {
      for (let b = vbox.b0; b <= vbox.b1; b++) {
        const index = getColorIndex(r, g, b) // 获取当前颜色在直方图中的索引
        const count = histogram[index] // 获取该颜色在直方图中的计数
        ntot += count // 累加像素总数
        // 计算各颜色通道的加权和
        rsum += count * (r + 0.5) * mult
        gsum += count * (g + 0.5) * mult
        bsum += count * (b + 0.5) * mult
      }
    }
  }

  // 如果有像素数据，计算加权平均颜色
  if (ntot) {
    return {
      r: Math.min(255, Math.round(rsum / ntot)), // 计算红色通道平均值并限制在0-255范围内
      g: Math.min(255, Math.round(gsum / ntot)), // 计算绿色通道平均值并限制在0-255范围内
      b: Math.min(255, Math.round(bsum / ntot)) // 计算蓝色通道平均值并限制在0-255范围内
    }
  } else {
    // 如果没有像素数据，返回盒子中心点的颜色
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
  // 检查输入有效性：如果像素数组为空或maxColors不在有效范围内，返回空数组
  if (!pixels.length || maxColors < 2 || maxColors > 256) {
    return []
  }

  // 创建颜色直方图，统计各颜色出现的频率
  const histogram = createHistogram(pixels)
  // 创建初始颜色空间盒子，覆盖整个RGB颜色空间
  const vbox = createVbox(0, VBOX_LENGTH - 1, 0, VBOX_LENGTH - 1, 0, VBOX_LENGTH - 1)
  // 初始化颜色映射数组，包含初始盒子和其平均颜色等信息
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
