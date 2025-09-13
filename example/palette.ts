import { type AnyColor, logColorsWithLabels, Palette } from '../src/index.js'

const platte = new Palette('#3463eb', 10, { min: 0.14, max: 0.86 })
const colors = platte.all().reverse()
// 将 colors 数组转换为键值对对象，键为索引+1
const colorObject: Record<string, AnyColor> = {}
colors.forEach((color, index) => {
  colorObject[index + 1 + ''] = color
})
logColorsWithLabels(colorObject)
const m3Platte = Palette.create('#9371ed', 101)
const colorObject2: Record<string, AnyColor> = {}
m3Platte.all().forEach((color, index) => {
  colorObject2[index + 1 + ''] = color
})
logColorsWithLabels(colorObject2)
const cssVariables1 = colors.map((color, i) => `--color-a-${i}: ${color}`)
console.log(cssVariables1.join(';\n'))
const cssVariables = m3Platte.all().map((color, i) => `--color-${i}: ${color}`)
console.log(cssVariables.join(';\n'))
