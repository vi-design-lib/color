import { describe, expect, it } from 'vitest'
import { getPaletteColor, makePaletteArray, Palette } from '../src/index.js'

/**
 * 调色板：基础行为
 */
describe('调色板：基础行为', () => {
  it('getPaletteColor 获取指定索引颜色（HEX）', () => {
    const color = getPaletteColor(0, '#3366ff', 11, { outType: 'hex' })
    expect(color.startsWith('#')).toBe(true)
  })

  it('getPaletteColor 越界索引被限制到范围内', () => {
    const size = 11
    const last = getPaletteColor(999, '#3366ff', size, { outType: 'hex' })
    const expectLast = getPaletteColor(size - 1, '#3366ff', size, { outType: 'hex' })
    expect(last).toBe(expectLast)
  })

  it('makePaletteArray 生成完整色阶数组（长度正确）', () => {
    const arr = makePaletteArray('#3366ff', 11, { outType: 'hex' })
    expect(arr.length).toBe(11)
  })

  it('Palette 类：size 小于 9 抛错', () => {
    expect(() => new Palette('#3366ff', 8)).toThrowError()
  })

  it('Palette 类：get 缓存与 all/迭代器一致', () => {
    const p = new Palette('#3366ff', 11, { outType: 'hex' })
    const g0 = p.get(0)
    const g0Again = p.get(0)
    expect(g0Again).toBe(g0)

    const all = p.all()
    const iter = [...p]
    expect(all).toEqual(iter)
  })
})

/**
 * 调色板：快照
 */
describe('调色板：快照', () => {
  it('makePaletteArray 输出快照（HEX 11阶）', () => {
    const arr = makePaletteArray('#3366ff', 11, { outType: 'hex' })
    expect(arr).toMatchSnapshot()
  })
})
