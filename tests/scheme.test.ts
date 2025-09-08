import { describe, expect, it } from 'vitest'
import { createScheme } from '../src/index.js'

/**
 * 配色方案：基础行为
 */
describe('配色方案：基础行为', () => {
  it('createScheme 创建实例（默认 HEX）', () => {
    const s = createScheme('#7c3aed')
    expect(s.light).toBeTruthy()
    expect(s.dark).toBeTruthy()
    expect(Object.keys(s.colors)).toContain('primary')
    expect(Object.keys(s.palettes)).toContain('primary')
    expect(Object.keys(s.tonalPalettes)).toContain('primary')
  })

  it('light 与 dark 的 roles 与 tonal 存在必要键', () => {
    const s = createScheme('#7c3aed')
    expect(s.light.roles.primary).toBeTruthy()
    expect(s.dark.roles.primary).toBeTruthy()
    expect(s.light.tonal['primary-1']).toBeTruthy()
    expect(s.dark.tonal['primary-10']).toBeTruthy()
  })

  it('支持 outType 配置（输出 HSL 对象）', () => {
    const s = createScheme('#7c3aed', { outType: 'HSL' })
    const color = s.colors.primary
    expect(typeof (color as any).h).toBe('number')
    expect(typeof (color as any).s).toBe('number')
    expect(typeof (color as any).l).toBe('number')
  })

  it('自定义规则合并与对比度调整不报错', () => {
    const s = createScheme('#7c3aed', {
      lightRoleRule: { source: 50, onSource: 100, base: { surface: 95 } as any }
    })
    expect(s.light.roles.primary).toBeTruthy()
    expect(s.light.roles.onPrimary).toBeTruthy()
    expect(s.light.roles.surface).toBeTruthy()
  })
})

/**
 * 配色方案：快照
 */
describe('配色方案：快照', () => {
  it('亮色与暗色角色快照', () => {
    const s = createScheme('#7c3aed')
    expect({ light: s.light.roles, dark: s.dark.roles }).toMatchSnapshot()
  })

  it('色调配色快照（primary 1/10）', () => {
    const s = createScheme('#7c3aed')
    expect({ p1: s.light.tonal['primary-1'], p10: s.dark.tonal['primary-10'] }).toMatchSnapshot()
  })
})
