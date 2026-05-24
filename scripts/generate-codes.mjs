#!/usr/bin/env node
/**
 * 儿宝伴侣 - 注册码批量生成工具
 * 格式：EB-XXXX-XXXX-XXXX
 * 字符集：大写字母A-Z（排除O/I）+ 数字0-9（排除0）
 * 用法：node generate-codes.mjs [数量] [--output 文件名]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// 去除易混淆字符：O、I、0
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ123456789';
const SECTION_LEN = 4;
const SECTIONS = 3;

function generateOne() {
  let code = 'EB-';
  for (let s = 0; s < SECTIONS; s++) {
    if (s > 0) code += '-';
    for (let i = 0; i < SECTION_LEN; i++) {
      code += CHARS[Math.floor(Math.random() * CHARS.length)];
    }
  }
  return code;
}

function generateBatch(count) {
  const set = new Set();
  while (set.size < count) {
    set.add(generateOne());
  }
  return Array.from(set);
}

// 解析命令行参数
function parseArgs() {
  const args = process.argv.slice(2);
  let count = 50;
  let output = null;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--output' || args[i] === '-o') {
      output = args[i + 1];
      i++;
    } else if (!isNaN(Number(args[i]))) {
      count = Number(args[i]);
    }
  }
  return { count, output };
}

const { count, output } = parseArgs();
const codes = generateBatch(count);

const header = `# 儿宝伴侣 注册码清单\n# 生成时间：${new Date().toLocaleString('zh-CN')}\n# 数量：${count} 个\n# 格式：EB-XXXX-XXXX-XXXX\n# 使用说明：每个注册码可激活一台设备，永久有效\n\n`;
const content = header + codes.map((c, i) => `${(i + 1).toString().padStart(3, ' ')}. ${c}`).join('\n') + '\n';

if (output) {
  const filePath = path.resolve(output);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ 已生成 ${count} 个注册码，保存至：${filePath}`);
} else {
  console.log(content);
}

console.log(`\n--- 校验信息 ---`);
console.log(`注册码数量：${codes.length}`);
const formatOk = codes.every(c => /^EB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(c));
console.log(`格式校验：${formatOk ? '✅ 全部通过' : '❌ 存在错误'}`);
console.log(`重复检查：${codes.length === new Set(codes).size ? '✅ 无重复' : '❌ 存在重复'}`);
