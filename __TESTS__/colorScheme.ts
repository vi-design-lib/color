import { logColorsWithLabels, Scheme } from '../src/index.js'

const scheme = Scheme.createBaseColorScheme('#1376e7')
// 打印所有颜色的 HEX 值
logColorsWithLabels(scheme as any)

const s = {
  main: '#1376E7',
  aux: '#3AD9B7',
  minor: '#6C44CF',
  warning: '#E48A2F',
  error: '#E42F2F',
  neutral: '#65707C'
}
