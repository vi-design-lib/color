#!/usr/bin/env ts-node

import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import readline from 'node:readline'
import * as process from 'node:process'

function run(cmd: string) {
  console.log(`\n▶ ${cmd}`)
  execSync(cmd, { stdio: 'inherit' })
}

/**
 * 创建一个提示用户输入并返回Promise的函数
 * @param question - 提示用户的问题字符串
 * @returns 返回一个Promise，解析为用户输入的答案（去除首尾空格）
 */
function prompt(question: string): Promise<string> {
  // 创建readline接口，用于从标准输入读取数据
  const rl = readline.createInterface({
    input: process.stdin, // 设置输入流为标准输入
    output: process.stdout // 设置输出流为标准输出
  })
  // 返回一个新的Promise，用于异步处理用户输入
  return new Promise((resolve) =>
    rl.question(question, (ans) => {
      rl.close() // 完成输入后关闭readline接口
      resolve(ans.trim()) // 解析用户输入并去除首尾空格
    })
  )
}

const pkgPath = path.join(process.cwd(), 'package.json')

/**
 * 回滚函数，用于在发生错误时撤销最近的提交并恢复文件状态
 * @param tagName - 可选参数，指定要删除的标签名称
 */
function rollback(tagName?: string) {
  console.log('\n⚠️  发生错误，正在回滚...') // 输出回滚提示信息
  try {
    run(`git reset --hard HEAD~1`) // 撤销最后一次 commit
  } catch {} // 忽略撤销提交时可能出现的错误
  if (tagName) {
    // 如果提供了标签名称
    try {
      run(`git tag -d ${tagName}`) // 删除指定的标签
    } catch {} // 忽略删除标签时可能出现的错误
  }
  try {
    run(`git checkout -- ${pkgPath}`) // 恢复 package.json 文件到最近一次提交的状态
  } catch {} // 忽略恢复文件时可能出现的错误
  console.error('❌ 已回滚到初始状态。') // 输出回滚完成信息
}

// 检查 git 状态
const gitStatus = execSync('git status --porcelain').toString().trim()
if (gitStatus) {
  console.error('❌ 请先提交或暂存当前更改再发布。')
  process.exit(1)
}

const type = process.argv[2] || 'patch' // 默认 patch

try {
  // 更新版本号（仅更新 lib/package.json，不打 git tag）
  run(`pnpm version ${type} --no-git-tag-version`)

  // 读取新版本号
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
  const newVersion: string = pkg.version
  const tagName = `v${newVersion}`
  console.log(`\n📦 新版本: ${pkg.name}@${newVersion}`)

  // 确认发布
  const answer = await prompt(`是否确认发布 ${pkg.name}@${newVersion}? (y/N) `)
  if (answer.toLowerCase() !== 'y') {
    console.log('🚫 已取消发布')
    rollback()
    process.exit(0)
  }

  // 生成 CHANGELOG (固定在根目录维护 changelog)
  run(`conventional-changelog -p angular -i CHANGELOG.md -s -r 0`)

  // 构建目标包
  run(`pnpm run build`)

  // 提交更新并打 tag
  run(`git add ${pkgPath} CHANGELOG.md`)
  run(`git commit -m "build(${pkg.name}): ${tagName}"`)
  run(`git tag -a ${tagName} -m "Release ${tagName}"`)

  // 发布到 npm（只发目标包）
  run(`pnpm publish --access public --registry https://registry.npmjs.org/`)

  // 推送到远程仓库
  run('git push && git push --tags')

  console.log(`\n✅ 发布完成 ${pkg.name}@${newVersion}`)
} catch (err) {
  console.error(err)
  rollback()
  process.exit(1)
}
