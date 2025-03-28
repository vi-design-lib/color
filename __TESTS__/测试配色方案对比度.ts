import { createScheme, schemeContrastRation } from '../src/index.js'

/**
 * 过滤小于阈值的值
 *
 * @param {Record<string, number>} input - 输入对象
 * @param {number} threshold - 阈值
 */
function filterValuesLessThanThreshold(
  input: Record<string, number>,
  threshold: number = 4.5
): Record<string, number> {
  const result: Record<string, number> = {}
  for (const [key, value] of Object.entries(input)) {
    // if (value <= threshold || value >= 7) result[key] = value
    if (value < threshold) result[key] = value
  }
  return result
}
const theme = createScheme('#9371ed')
console.log(
  '亮色模式不符合规范角色',
  filterValuesLessThanThreshold(schemeContrastRation(theme.light.roles))
)
console.log(
  '暗色模式不符合规范角色',
  filterValuesLessThanThreshold(schemeContrastRation(theme.dark.roles))
)
