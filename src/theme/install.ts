import type { BaseThemeOptions } from './base-theme.js'
import type { AnyColor } from '../types.js'
import { Theme } from './theme.js'

export interface Options<T extends AnyColor, CustomKeys extends string>
  extends BaseThemeOptions<T, CustomKeys> {
  /**
   * 主色
   *
   * @default '#1677ff'
   */
  primary?: T
}

/**
 * 安装主题
 *
 * 支持 `Vitarx2` 、 `Vue3`
 *
 * @param {Object} app - Vitarx、Vue应用实例
 * @param {Object} options - 选项
 * @returns {void}
 */
export function installTheme<T extends AnyColor, CustomKeys extends string>(
  app: any,
  options?: Options<T, CustomKeys>
): void {
  if (typeof app?.provide === 'function') {
    const { primary = '#1677ff', ...config } = options || {}
    if (!primary) throw new Error('primary color is required')
    const theme = new Theme(primary, config)
    // 注入到应用中
    app.provide('theme', theme)
    // 如果是 vitarx，则注入到APP容器中
    if (typeof app.register === 'function') {
      app.register('theme', theme)
    }
    // 如果是vue3，则注入到全局属性中
    if (typeof app.config?.globalProperties === 'object') {
      app.config.globalProperties.$theme = theme
    }
  }
}
