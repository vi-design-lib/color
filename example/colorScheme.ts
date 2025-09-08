import { logColorsWithLabels, Scheme } from '../src/index.js'

const mode = ['triadic', 'adjacent', 'complementary']
mode.forEach((m) => {
  const scheme = Scheme.createBaseColorScheme('#461faa', m as any)
  // 打印所有颜色的 HEX 值
  logColorsWithLabels(scheme as any)

  console.log('-----------------------')
})
