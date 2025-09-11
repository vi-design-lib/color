import { describe, expect, it } from 'vitest'
import { rgbColorToObj } from '../src/index.js'

/**
 * 颜色转换：基础行为
 */
describe('颜色转换：rgbColorToObj', () => {
  it('rgbColorToObj 正确解析 RGB 格式颜色', () => {
    const result = rgbColorToObj('rgb(255, 128, 64)')
    expect(result).toEqual({ r: 255, g: 128, b: 64 })
  })

  it('rgbColorToObj 正确解析带空格的 RGB 格式颜色', () => {
    const result = rgbColorToObj('rgb(100, 200, 50)')
    expect(result).toEqual({ r: 100, g: 200, b: 50 })
  })

  it('rgbColorToObj 抛出错误当输入无效格式', () => {
    expect(() => rgbColorToObj('invalid-color')).toThrowError('Invalid RGB or RGBA string format')
  })

  it('rgbColorToObj 抛出错误当输入不完整 RGB 格式', () => {
    expect(() => rgbColorToObj('rgb(255, 128)')).toThrowError('Invalid RGB or RGBA string format')
  })

  it('rgbColorToObj 正确解析 RGBA 格式颜色（忽略透明度）', () => {
    const result = rgbColorToObj('rgba(255, 128, 64, 0.5)')
    expect(result).toEqual({ r: 255, g: 128, b: 64 })
  })

  it('rgbColorToObj 正确解析不带空格的 RGBA 格式颜色', () => {
    const result = rgbColorToObj('rgba(100,200,50, 0.8)')
    expect(result).toEqual({ r: 100, g: 200, b: 50 })
  })

  it('rgbColorToObj 抛出错误当输入不完整 RGBA 格式', () => {
    expect(() => rgbColorToObj('rgba(255, 128, 64)')).toThrowError(
      'Invalid RGB or RGBA string format'
    )
  })
})
