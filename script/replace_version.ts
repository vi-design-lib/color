import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'
import * as process from 'node:process'

const packagePath = join(process.cwd(), 'package.json')
const pak = JSON.parse(readFileSync(packagePath, 'utf-8'))
const version = pak.version
const distPath = join(process.cwd(), 'dist/constant.js')
// 读取文件内容
const content = readFileSync(distPath, 'utf-8')
// 替换版本号占位符
writeFileSync(distPath, content.replace(/__VERSION__/g, `"${version}"`), 'utf-8')
