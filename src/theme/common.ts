export type RefFactory = <T>(value: T) => { value: T }
export type Ref<T> = { value: T }
export const ref = <T>(value: T): Ref<T> => {
  return { value }
}

/**
 * 将字符串哈希为32位不重复的字符串
 * @param str 要哈希的字符串
 * @returns {string} 32位的哈希字符串
 */
export function hashStringTo32Bit(str: string): string {
  let hash = 0

  // 如果字符串为空，返回0
  if (str.length === 0) return '0'.repeat(32)

  // 遍历字符串中的每个字符
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    // 使用简单的哈希算法
    hash = (hash << 5) - hash + char
    // 转换为32位整数
    hash = hash & hash
  }

  // 确保哈希值为正数
  hash = Math.abs(hash)

  // 将数字转换为36进制字符串（包含0-9和a-z）
  let hashStr = hash.toString(36)

  // 如果哈希字符串不足32位，重复拼接直到达到32位
  while (hashStr.length < 32) {
    hashStr += hashStr
  }

  // 截取前32位
  hashStr = hashStr.substring(0, 32)

  // 确保长度为32位
  return hashStr.padEnd(32, '0')
}
