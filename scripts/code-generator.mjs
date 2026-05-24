#!/usr/bin/env node
/**
 * EBaby 注册码生成器 v1.0
 * 用法：
 *   单条生成：  node code-generator.mjs --phone 13800000000
 *   优惠码：    node code-generator.mjs --phone 13800000000 --discount
 *   批量生成：  node code-generator.mjs --batch phones.csv
 *   查看记录：  node code-generator.mjs --list
 *
 * 输出： 手机号 | 注册码 | 到期日 | 价格
 * 记录保存： scripts/codes.json（防止重复发卡）
 */

import crypto from 'crypto'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dir = path.dirname(fileURLToPath(import.meta.url))
const CODES_DB = path.join(__dir, 'codes.json')
const SECRET = '_ebaby_2026_secret_key_@x8f3k9m'

const PRICE_NORMAL = 50
const PRICE_EARLY = 20
const EARLY_LIMIT = 100

// ========== 工具函数 ==========

function loadCodesDB() {
  if (!fs.existsSync(CODES_DB)) return { seq: 0, records: [] }
  return JSON.parse(fs.readFileSync(CODES_DB, 'utf8'))
}

function saveCodesDB(db) {
  fs.writeFileSync(CODES_DB, JSON.stringify(db, null, 2), 'utf8')
}

function hmacCode(phone, timestamp, seq) {
  // 注册码 = HMAC-SHA256(phone|timestamp|seq, SECRET) → hex → BigInt → Base36(12位)
  const msg = `${phone}|${Math.floor(timestamp / 86400000) * 86400000}|${seq}`
  const hmac = crypto.createHmac('sha256', SECRET)
  hmac.update(msg)
  const digest = hmac.digest('hex').slice(0, 20)
  const big = BigInt('0x' + digest)
  const raw = big.toString(36).toUpperCase().padStart(12, '0')
  // 格式：EB-XXXX-XXXX-XXXX
  return `EB-${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`
}

function formatDate(ts) {
  const d = new Date(ts)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ========== 核心：生成单条注册码 ==========

function generateCode(phone, isDiscount = false) {
  const db = loadCodesDB()
  const seq = db.seq + 1
  const now = Date.now()
  const expireTs = now + 365 * 86400000
  const code = hmacCode(phone, now, seq)

  const price = isDiscount || seq <= EARLY_LIMIT ? PRICE_EARLY : PRICE_NORMAL
  const label = (isDiscount || seq <= EARLY_LIMIT) ? '优惠价' : '正常价'

  const record = {
    seq,
    phone,
    code,
    price,
    label,
    generatedAt: new Date(now).toISOString(),
    expireDate: formatDate(expireTs),
    expireTs,
    used: false,
  }

  db.seq = seq
  db.records.push(record)
  saveCodesDB(db)

  return { ...record, expireDate: formatDate(expireTs) }
}

// ========== 批量生成 ==========

function batchGenerate(csvPath) {
  if (!fs.existsSync(csvPath)) {
    console.error(`文件不存在：${csvPath}`)
    process.exit(1)
  }
  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').map(l => l.trim()).filter(Boolean)
  console.log(`\n📦 批量生成，共 ${lines.length} 条\n`)
  console.log('手机号'.padEnd(15), '|', '注册码'.padEnd(22), '|', '到期日'.padEnd(12), '|', '价格')
  console.log('-'.repeat(65))
  for (const line of lines) {
    const phone = line.replace(/[^0-9]/g, '')
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      console.warn(`  ⚠️  跳过无效手机号：${line}`)
      continue
    }
    const db = loadCodesDB()
    const r = generateCode(phone, db.seq + 1 <= EARLY_LIMIT)
    console.log(
      r.phone.padEnd(15),
      '|',
      r.code.padEnd(22),
      '|',
      r.expireDate.padEnd(12),
      '|',
      `¥${r.price}（${r.label}）`
    )
  }
  const db = loadCodesDB()
  console.log(`\n✅ 完成！当前已发放 ${db.seq} 张（优惠名额剩余 ${Math.max(0, EARLY_LIMIT - db.seq)} 个）\n`)
}

// ========== 查看历史记录 ==========

function listRecords() {
  const db = loadCodesDB()
  if (db.records.length === 0) {
    console.log('\n📭  暂无发码记录\n')
    return
  }
  console.log(`\n📋 发码记录（共 ${db.records.length} 条，优惠名额已用 ${Math.min(db.seq, EARLY_LIMIT)}/${EARLY_LIMIT}）\n`)
  console.log('序号'.padEnd(6), '|', '手机号'.padEnd(15), '|', '注册码'.padEnd(22), '|', '到期日'.padEnd(12), '|', '价格', '|', '生成时间')
  console.log('-'.repeat(90))
  for (const r of db.records.slice(-30)) {
    console.log(
      String(r.seq).padEnd(6),
      '|',
      r.phone.padEnd(15),
      '|',
      r.code.padEnd(22),
      '|',
      r.expireDate.padEnd(12),
      '|',
      `¥${r.price}`.padEnd(6),
      '|',
      r.generatedAt.slice(0, 19).replace('T', ' ')
    )
  }
  if (db.records.length > 30) console.log(`  ...（仅显示最近30条，共${db.records.length}条）`)
  console.log()
}

// ========== CLI 参数解析 ==========

function parseArgs() {
  const args = process.argv.slice(2)
  const result = { phone: null, discount: false, batch: null, list: false }

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--phone' && args[i + 1]) {
      result.phone = args[i + 1]; i++
    } else if (args[i] === '--discount') {
      result.discount = true
    } else if (args[i] === '--batch' && args[i + 1]) {
      result.batch = args[i + 1]; i++
    } else if (args[i] === '--list' || args[i] === '-l') {
      result.list = true
    } else if (args[i] === '--help' || args[i] === '-h') {
      showHelp()
      process.exit(0)
    }
  }
  return result
}

function showHelp() {
  console.log(`
EBaby 注册码生成器 v1.0

用法：
  node code-generator.mjs --phone 13800000000 [--discount]
  node code-generator.mjs --batch phones.csv
  node code-generator.mjs --list

选项：
  --phone <手机号>     生成单条注册码
  --discount            强制生成优惠价（¥20）码
  --batch <csv文件>     批量生成（CSV每行一个手机号）
  --list, -l            查看历史发码记录
  --help, -h            显示帮助

定价：
  前 ${EARLY_LIMIT} 名：¥${PRICE_EARLY}/年（自动识别）
  第 ${EARLY_LIMIT + 1} 名起：¥${PRICE_NORMAL}/年

记录文件：scripts/codes.json
`)
}

// ========== 主程序 ==========

function main() {
  const args = parseArgs()

  if (args.list) {
    listRecords()
    return
  }

  if (args.batch) {
    batchGenerate(args.batch)
    return
  }

  if (!args.phone) {
    showHelp()
    console.error('❌ 请提供 --phone 参数\n')
    process.exit(1)
  }

  const phone = args.phone.replace(/[^0-9]/g, '')
  if (!/^1[3-9]\d{9}$/.test(phone)) {
    console.error(`❌ 无效手机号：${args.phone}\n`)
    process.exit(1)
  }

  const r = generateCode(phone, args.discount)
  console.log('\n✅ 注册码生成成功！\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`  手机号：${r.phone}`)
  console.log(`  注册码：${r.code}`)
  console.log(`  有效期：1年（至 ${r.expireDate}）`)
  console.log(`  价格：  ¥${r.price}（${r.label}）`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('  发给客户的话术参考：')
  console.log(`  「您已购买EBaby儿童辨证年会员，注册码：${r.code}`)
  console.log(`  请在 EBaby 首页点击"注册会员"，输入手机号和注册码即可激活，有效期至 ${r.expireDate}。」\n`)
}

main()
