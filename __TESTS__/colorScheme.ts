import { logColorsWithLabels, Scheme } from '../src/index.js'

const mode = ['triadic', 'adjacent', 'complementary']
mode.forEach((m) => {
  const scheme = Scheme.createBaseColorScheme('#461faa', m as any)
  // 打印所有颜色的 HEX 值
  logColorsWithLabels(scheme as any)

  console.log('')
})

const s = {
  primary: '#451FA8',
  aux: '#BA0F8A',
  minor: '#B04319',
  warning: '#A46525',
  error: '#B01919',
  neutral: '#5D5573'
}
