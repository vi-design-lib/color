import type { HexColor, RGBObject } from '../types.js'
import { rgbObjectToHexColor } from './conversion.js'

interface Pixel {
  r: number
  g: number
  b: number
  count: number
}

interface ColorBox {
  pixels: Pixel[]
  volume: number
  range: {
    r: { min: number; max: number }
    g: { min: number; max: number }
    b: { min: number; max: number }
  }
}

/**
 * 计算颜色盒子的体积
 */
function calculateVolume(box: ColorBox): number {
  const { range } = box
  return (
    (range.r.max - range.r.min + 1) *
    (range.g.max - range.g.min + 1) *
    (range.b.max - range.b.min + 1)
  )
}

/**
 * 找出具有最大范围的颜色通道
 */
function findBiggestColorRange(box: ColorBox): 'r' | 'g' | 'b' {
  const rRange = box.range.r.max - box.range.r.min
  const gRange = box.range.g.max - box.range.g.min
  const bRange = box.range.b.max - box.range.b.min

  const max = Math.max(rRange, gRange, bRange)

  if (max === rRange) return 'r'
  if (max === gRange) return 'g'
  return 'b'
}

/**
 * 计算颜色盒子的范围
 */
function calculateColorRange(pixels: Pixel[]): ColorBox['range'] {
  const range = {
    r: { min: 255, max: 0 },
    g: { min: 255, max: 0 },
    b: { min: 255, max: 0 }
  }

  pixels.forEach((pixel) => {
    range.r.min = Math.min(range.r.min, pixel.r)
    range.r.max = Math.max(range.r.max, pixel.r)
    range.g.min = Math.min(range.g.min, pixel.g)
    range.g.max = Math.max(range.g.max, pixel.g)
    range.b.min = Math.min(range.b.min, pixel.b)
    range.b.max = Math.max(range.b.max, pixel.b)
  })

  return range
}

/**
 * 对颜色盒子进行分割
 */
function splitBox(box: ColorBox): ColorBox[] {
  if (box.pixels.length === 0) return [box]

  const channel = findBiggestColorRange(box)
  const sortedPixels = [...box.pixels].sort((a, b) => a[channel] - b[channel])
  const mid = Math.floor(sortedPixels.length / 2)

  const box1 = {
    pixels: sortedPixels.slice(0, mid),
    volume: 0,
    range: calculateColorRange(sortedPixels.slice(0, mid))
  }
  box1.volume = calculateVolume(box1)

  const box2 = {
    pixels: sortedPixels.slice(mid),
    volume: 0,
    range: calculateColorRange(sortedPixels.slice(mid))
  }
  box2.volume = calculateVolume(box2)

  return [box1, box2]
}

/**
 * 计算颜色盒子的平均颜色
 */
function calculateAverageColor(box: ColorBox): HexColor {
  if (box.pixels.length === 0) return '#000000'

  let totalR = 0,
    totalG = 0,
    totalB = 0,
    totalCount = 0

  box.pixels.forEach((pixel) => {
    totalR += pixel.r * pixel.count
    totalG += pixel.g * pixel.count
    totalB += pixel.b * pixel.count
    totalCount += pixel.count
  })

  return rgbObjectToHexColor({
    r: Math.round(totalR / totalCount),
    g: Math.round(totalG / totalCount),
    b: Math.round(totalB / totalCount)
  })
}

/**
 * 从图片元素中获取颜色
 *
 * @param {HTMLImageElement} image - 图片元素
 * @returns {RGBObject} - RGB对象
 */
export async function colorFromImageElement(image: HTMLImageElement): Promise<HexColor> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Failed to get canvas context')
  const imageBytes = await new Promise(
    (resolve: (value: Uint8ClampedArray<ArrayBufferLike>) => void) => {
      const callback = () => {
        canvas.width = image.width
        canvas.height = image.height
        let rect = [0, 0, image.width, image.height]
        const area = image.dataset['area']
        if (area && /^\d+(\s*,\s*\d+){3}$/.test(area)) {
          rect = area.split(/\s*,\s*/).map((s) => {
            return parseInt(s, 10)
          })
        }
        const [sx, sy, sw, sh] = rect
        context.drawImage(image, 0, 0)
        resolve(context.getImageData(sx, sy, sw, sh).data)
      }
      if (image.complete) {
        callback()
      } else {
        image.onload = callback
      }
    }
  )

  // 统计像素颜色
  const colorMap = new Map<string, Pixel>()
  for (let i = 0; i < imageBytes.length; i += 4) {
    const r = imageBytes[i]
    const g = imageBytes[i + 1]
    const b = imageBytes[i + 2]
    const a = imageBytes[i + 3]
    if (a < 255) continue
    const key = `${r},${g},${b}`

    const pixel = colorMap.get(key)
    if (pixel) {
      pixel.count++
    } else {
      colorMap.set(key, { r, g, b, count: 1 })
    }
  }

  // 创建初始颜色盒子
  const initialBox: ColorBox = {
    pixels: Array.from(colorMap.values()),
    volume: 0,
    range: calculateColorRange(Array.from(colorMap.values()))
  }
  initialBox.volume = calculateVolume(initialBox)

  // 使用中位切分算法进行颜色量化
  let boxes = [initialBox]
  const iterations = 4 // 控制颜色量化的精度

  for (let i = 0; i < iterations && boxes.length < 16; i++) {
    const boxToSplit = boxes.reduce((prev, curr) => (prev.volume > curr.volume ? prev : curr))
    const index = boxes.indexOf(boxToSplit)
    if (index !== -1) {
      boxes.splice(index, 1)
      boxes.push(...splitBox(boxToSplit))
    }
  }

  // 找出包含最多像素的颜色盒子
  const dominantBox = boxes.reduce((prev, curr) => {
    const prevCount = prev.pixels.reduce((sum, p) => sum + p.count, 0)
    const currCount = curr.pixels.reduce((sum, p) => sum + p.count, 0)
    return prevCount > currCount ? prev : curr
  })

  // 返回主要颜色
  return calculateAverageColor(dominantBox)
}

/**
 * 从图片元素中获取颜色
 *
 * @param {string} image - 图片URL，或者base64字符串，或图片本地路径
 * @returns {string} 16进制颜色值
 */
export function colorFromImage(image: string): Promise<HexColor> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(colorFromImageElement(img))
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = image
  })
}
