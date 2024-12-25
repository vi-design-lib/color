/**
 * 输出带有颜色的键值对对象到控制台
 *
 * @param {Record<string, string>} colorObj - 键值对对象，键为颜色名称，值为颜色值（HEX颜色）
 */
export function logColorsWithLabels(colorObj: Record<string, string>): void {
  // 判断当前环境是否是浏览器
  const isBrowser = typeof window !== 'undefined'

  if (!isBrowser) {
    // 非浏览器环境，使用 ANSI 颜色代码
    const hexToAnsi = (hex: string): string => {
      // 去除 '#' 符号并解析 RGB
      const r = parseInt(hex.slice(1, 3), 16)
      const g = parseInt(hex.slice(3, 5), 16)
      const b = parseInt(hex.slice(5, 7), 16)

      // 计算最接近的 ANSI 颜色（0-15）
      const ansiColor =
        16 +
        Math.round((r / 255) * 5) * 36 +
        Math.round((g / 255) * 5) * 6 +
        Math.round((b / 255) * 5)
      return `\x1b[38;5;${ansiColor}m` // ANSI 转义码
    }

    // 在终端中输出颜色
    Object.entries(colorObj).forEach(([key, color]) => {
      // 获取颜色对应的 ANSI 代码
      const ansiColor = hexToAnsi(color)
      // 输出带有颜色的键值对
      console.log(`${ansiColor}${key}: ${color}\x1b[0m`) // \x1b[0m 用于重置颜色
    })
  } else {
    // 浏览器环境，使用 console.log 和 CSS 样式
    console.group()
    Object.entries(colorObj).forEach(([key, color]) => {
      // 输出颜色标签和对应的颜色
      console.log(`%c${key}: ${color}`, `color: ${color}; font-weight: bold;`)
    })
    console.groupEnd()
  }
}
