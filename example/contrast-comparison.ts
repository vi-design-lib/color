/**
 * 新的智能对比度调整算法示例
 *
 * 展示同时调整前景色和背景色的效果
 */

import { adjustForContrast, type HexColor } from '../src/index.js'

// 把 hex 转换成 RGB
function hexToRgb(hex: string): [number, number, number] {
  hex = hex.replace(/^#/, '')
  if (hex.length === 3) {
    hex = hex
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const num = parseInt(hex, 16)
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255]
}

// 输出带颜色的文字
function logColoredText(text: string, bg: string, fg: string): void {
  const [fr, fg_, fb] = hexToRgb(fg) // 前景色 RGB
  const [br, bg_, bb] = hexToRgb(bg) // 背景色 RGB

  // 38 表示前景色，48 表示背景色
  const ansiFgColor = `\x1b[38;2;${fr};${fg_};${fb}m`
  const ansiBgColor = `\x1b[48;2;${br};${bg_};${bb}m`

  console.log(`${ansiFgColor}${ansiBgColor}${text}\x1b[0m`)
}

console.log('🎨 对比度调整算法对比演示')
console.log('==============================\n')

// 测试用例：低对比度的相似颜色
const testCases = [
  { fg: '#7c3aed', bg: '#9333ea', name: '紫色系相似颜色' },
  { fg: '#ef4444', bg: '#f87171', name: '红色系相似颜色' },
  { fg: '#3b82f6', bg: '#60a5fa', name: '蓝色系相似颜色' },
  { fg: '#888888', bg: '#cccccc', name: '灰色系中等对比度' }
]

for (const test of testCases) {
  console.log(`📝 测试用例: ${test.name}`)
  logColoredText(`原始颜色 -> 前景：${test.fg}，背景${test.bg}`, test.bg, test.fg)

  // 新算法：同时调整前景色和背景色
  const newResult = adjustForContrast(test.fg as HexColor, test.bg as HexColor, 'AAA')
  logColoredText(
    `新算法（智能调整）-> 前景：${newResult.foreground}，背景${newResult.background}`,
    newResult.background,
    newResult.foreground
  )

  console.log('---\n')
}

console.log('✨ 新算法优势:')
console.log('1. 同时优化前景色和背景色，获得更好的视觉平衡')
console.log('2. 保持颜色的柔和协调，避免过于强烈的对比')
console.log('3. 智能调整亮度和饱和度，确保符合WCAG标准')
console.log('4. 提供完整的颜色方案而非单一前景色调整')
