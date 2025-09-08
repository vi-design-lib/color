import { Palette } from '../src/index.js'

const platte = new Palette('#3463eb', 10, { min: 0.1, max: 0.9 })
console.log(platte.all().reverse())
