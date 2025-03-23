import type { HexColor, RGBObject } from '../types.js'
import { rgbObjectToHexColor } from './conversion.js'
import { quantize } from './quantizer.js'
import { score } from './score.js'

interface Pixel {
  r: number
  g: number
  b: number
  count: number
}

/**
 * 获取图片字节
 *
 * @param canvas
 * @param image
 * @param context
 */
const getImageBytes = async (
  canvas: HTMLCanvasElement,
  image: HTMLImageElement,
  context: CanvasRenderingContext2D
) => {
  return await new Promise((resolve: (value: Uint8ClampedArray<ArrayBufferLike>) => void) => {
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
  })
}

/**
 * 从图片元素中获取颜色
 *
 * 如果图片是纯黑色或纯白色会返回 `#1677ff` 做为默认颜色
 *
 * @param {HTMLImageElement} image - 图片元素
 * @returns {Promise<HexColor>} - 16进制颜色
 */
export async function colorFromImageElement(image: HTMLImageElement): Promise<HexColor> {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Failed to get canvas context')
  const imageBytes = await getImageBytes(canvas, image, context)

  // 统计像素颜色
  const colorMap = new Map<string, Pixel>()
  for (let i = 0; i < imageBytes.length; i += 4) {
    const r = imageBytes[i]
    const g = imageBytes[i + 1]
    const b = imageBytes[i + 2]
    const a = imageBytes[i + 3]
    // 跳过透明像素、纯白色和纯黑色像素，以及低饱和度的像素
    if (a < 255 || (r === 255 && g === 255 && b === 255) || (r === 0 && g === 0 && b === 0))
      continue

    // 计算饱和度
    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    const saturation = max === 0 ? 0 : (max - min) / max

    // 跳过低饱和度的像素
    if (saturation < 0.2) continue
    const key = `${r},${g},${b}`

    const pixel = colorMap.get(key)
    if (pixel) {
      pixel.count++
    } else {
      colorMap.set(key, { r, g, b, count: 1 })
    }
  }

  // 如果是纯黑色或纯白色图片，则返回默认颜色
  if (colorMap.size === 0) return '#1677ff'
  // 将像素数据转换为 RGBObject 数组，同时保留频率信息
  const pixels: RGBObject[] = Array.from(colorMap.values()).map((pixel) => ({
    r: pixel.r,
    g: pixel.g,
    b: pixel.b
  }))

  // 创建颜色频率映射
  const frequencyMap = new Map<string, number>()
  for (const [key, pixel] of colorMap.entries()) {
    frequencyMap.set(key, pixel.count)
  }

  // 使用量化器进行颜色量化
  const quantizedColors = quantize(pixels, 138)

  // 使用评分系统选择最佳颜色，传入频率信息
  const rankedColors = score(quantizedColors, frequencyMap)

  // 返回得分最高的颜色
  return rgbObjectToHexColor(rankedColors[0])
}

/**
 * 从图片元素中获取颜色
 *
 * @param {string} src - 任意可以使用`img`加载的图片src
 * @returns {Promise<HexColor>} 16进制颜色值
 */
export function colorFromImage(src: string): Promise<HexColor> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve(colorFromImageElement(img))
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = src
  })
}
