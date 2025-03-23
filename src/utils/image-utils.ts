import type { RGBObject } from '../types.js'

/**
 * 从图片元素中获取颜色
 *
 * @param {HTMLImageElement} image - 图片元素
 * @returns {RGBObject} - RGB对象
 */
export function colorFromImageElement(image: HTMLImageElement): RGBObject {
  const canvas = document.createElement('canvas')
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Failed to get canvas context')

  canvas.width = image.width
  canvas.height = image.height
  context.drawImage(image, 0, 0)

  const imageData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imageData.data
  let r = 0,
    g = 0,
    b = 0

  // 计算所有像素的RGB平均值
  for (let i = 0; i < data.length; i += 4) {
    r += data[i]
    g += data[i + 1]
    b += data[i + 2]
  }

  const pixelCount = data.length / 4
  r = Math.round(r / pixelCount)
  g = Math.round(g / pixelCount)
  b = Math.round(b / pixelCount)

  // 转换为16进制颜色
  return { r, g, b }
}

/**
 * 从图片元素中获取颜色
 *
 * @param {string} image - 图片URL，或者base64字符串，或图片本地路径
 * @returns {string} 16进制颜色值
 */
export function colorFromImage(image: string): Promise<RGBObject> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'Anonymous'
    img.onload = () => {
      resolve(colorFromImageElement(img))
    }
    img.onerror = () => {
      reject(new Error('Failed to load image'))
    }
    img.src = image
  })
}
