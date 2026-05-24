import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { showToast } from 'vant'

// ========== 配置区 ==========
const TRIAL_DAYS = 30
const MEMBER_PRICE_NORMAL = 50   // 正常价 50元/年
const MEMBER_PRICE_EARLY = 20   // 前100名优惠价 20元/年
const EARLY_BIRD_LIMIT = 100     // 前100名
const CODE_PREFIX = 'EB-'
const SECRET_KEY = '_ebaby_2026_secret_key_@x8f3k9m'  // 注册码加密密钥（内置，用户不可见）

// ========== 会员序号管理（localStorage） ==========
function getMemberSeq() {
  let seq = parseInt(localStorage.getItem('eb_member_seq') || '0')
  return seq
}
function incrMemberSeq() {
  let seq = getMemberSeq() + 1
  localStorage.setItem('eb_member_seq', seq.toString())
  return seq
}

// ========== HMAC-SHA256 注册码生成/验证 ==========
function hmacSign(phone, timestamp, seq) {
  // 注册码 = HMAC-SHA256(phone + '|' + timestamp + '|' + seq, SECRET_KEY)
  // 输出取前10字节 → Base36 → 12位 → 格式化为 EB-XXXX-XXXX-XXXX
  const crypto = window.crypto ? null : null // 浏览器环境用 Web Crypto API
  // 用 Node.js 风格兼容（Vite 构建后会走 Web Crypto）
  return _hmacWeb(phone, timestamp, seq)
}

// 浏览器 Web Crypto API 实现
async function _hmacWeb(phone, timestamp, seq) {
  const msg = `${phone}|${timestamp}|${seq}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(SECRET_KEY)
  const msgData = encoder.encode(msg)

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  return _bufToBase36(sigBuf)
}

// Node 环境（生成器脚本用）
function hmacSignNode(phone, timestamp, seq) {
  const crypto = require('crypto')
  const msg = `${phone}|${timestamp}|${seq}`
  const hmac = crypto.createHmac('sha256', SECRET_KEY)
  hmac.update(msg)
  const digest = hmac.digest('hex') // 64位hex
  // 取前20位hex → 转BigInt → Base36
  const big = BigInt('0x' + digest.slice(0, 20))
  return big.toString(36).toUpperCase().padStart(12, '0')
}

function _bufToBase36(buf) {
  // ArrayBuffer → hex → BigInt → Base36
  const arr = Array.from(new Uint8Array(buf))
  const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20)
  const big = BigInt('0x' + hex)
  return big.toString(36).toUpperCase().padStart(12, '0')
}

function formatCode(raw) {
  // raw: 12位base36 → EB-XXXX-XXXX-XXXX
  return CODE_PREFIX + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12)
}

// 验证注册码（浏览器端）
async function verifyCodeInternal(phone, code) {
  // 去掉 EB- 前缀
  const clean = code.replace(/^EB-?/, '').replace(/-/g, '')
  if (clean.length !== 12) return { ok: false, msg: '注册码格式错误' }

  // 遍历最近200个序号尝试匹配（防止时间戳偏差）
  const encoder = new TextEncoder()
  const keyData = encoder.encode(SECRET_KEY)

  for (let seq = 1; seq <= Math.max(1, getMemberSeq()); seq++) {
    // 尝试用不同时间戳窗口（±2天）验证
    const now = Date.now()
    const windows = [
      now,
      now - 86400000 * 1,
      now - 86400000 * 2,
      now + 86400000 * 1,
      now + 86400000 * 2,
    ]
    for (const ts of windows) {
      const msg = `${phone}|${Math.floor(ts / 86400000) * 86400000}|${seq}`
      try {
        const cryptoKey = await crypto.subtle.importKey(
          'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
        )
        const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, encoder.encode(msg))
        const arr = Array.from(new Uint8Array(sigBuf))
        const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20)
        const big = BigInt('0x' + hex)
        const raw = big.toString(36).toUpperCase().padStart(12, '0')
        if (raw === clean) {
          return { ok: true, seq, ts: Math.floor(ts / 86400000) * 86400000 }
        }
      } catch (e) { /* ignore */ }
    }
  }
  return { ok: false, msg: '注册码验证失败，请检查手机号和注册码是否正确' }
}

// ========== Store 主体 ==========
export const useTrialStore = defineStore('trial', () => {

  // ---- 试用逻辑（保留） ----
  function getFirstVisit() {
    let first = localStorage.getItem('eb_first_visit')
    if (!first) {
      first = Date.now().toString()
      localStorage.setItem('eb_first_visit', first)
    }
    return parseInt(first)
  }

  const remainingDays = computed(() => {
    if (isMember.value) return 9999
    const first = getFirstVisit()
    const now = Date.now()
    const elapsed = (now - first) / (1000 * 60 * 60 * 24)
    const left = Math.ceil(TRIAL_DAYS - elapsed)
    return left > 0 ? left : 0
  })

  const isExpired = computed(() => {
    if (isMember.value) return false
    return remainingDays.value <= 0
  })

  // ---- 会员逻辑 ----
  const phoneNumber = computed(() => {
    return localStorage.getItem('eb_member_phone') || ''
  })

  const memberExpire = computed(() => {
    const exp = localStorage.getItem('eb_member_expire')
    return exp ? parseInt(exp) : 0
  })

  const isMember = computed(() => {
    const exp = memberExpire.value
    return exp > 0 && exp > Date.now()
  })

  const memberExpireDate = computed(() => {
    if (!memberExpire.value) return ''
    return new Date(memberExpire.value).toLocaleDateString('zh-CN')
  })

  const memberDaysLeft = computed(() => {
    if (!isMember.value) return 0
    return Math.ceil((memberExpire.value - Date.now()) / (1000 * 60 * 60 * 24))
  })

  const isEarlyBird = computed(() => {
    const seq = parseInt(localStorage.getItem('eb_member_seq') || '0')
    return seq <= EARLY_BIRD_LIMIT
  })

  const memberPrice = computed(() => {
    return isEarlyBird.value ? MEMBER_PRICE_EARLY : MEMBER_PRICE_NORMAL
  })

  // ---- 注册码激活（会员用） ----
  // 在注册页调用：输入手机号 + 注册码 → 验证 → 写会员信息
  async function activateByCode(phone, code) {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      return { ok: false, msg: '请输入正确的手机号' }
    }
    const result = await verifyCodeInternal(phone, code)
    if (!result.ok) {
      return { ok: false, msg: result.msg }
    }
    // 验证通过 → 写会员信息（有效期1年）
    const expire = Date.now() + 365 * 86400000
    localStorage.setItem('eb_member_phone', phone)
    localStorage.setItem('eb_member_expire', expire.toString())
    localStorage.setItem('eb_registered', 'true')
    // 记录序号（如果之前没记录过）
    if (!localStorage.getItem('eb_member_seq_' + phone)) {
      const seq = incrMemberSeq()
      localStorage.setItem('eb_member_seq_' + phone, seq.toString())
      localStorage.setItem('eb_member_activated_at', Date.now().toString())
    }
    return { ok: true, expireDate: new Date(expire).toLocaleDateString('zh-CN') }
  }

  // ---- 兼容性：旧版简单注册码（无手机号） ----
  function verifyCodeSimple(code) {
    const pattern = /^EB-[A-Z0-9]{4}-[A-Z0-9]{4}-[A-Z0-9]{4}$/
    if (!pattern.test(code)) return false
    const parts = code.split('-')
    const last = parts[3]
    const weights = [3, 7, 11, 13]
    let sum = 0
    for (let i = 0; i < 4; i++) {
      const c = last.charCodeAt(i)
      sum += (c % 36) * weights[i]
    }
    const valid = sum % 97 === 1
    if (valid) {
      // 旧版激活：默认1年
      const expire = Date.now() + 365 * 86400000
      localStorage.setItem('eb_registered', 'true')
      localStorage.setItem('eb_member_expire', expire.toString())
      return true
    }
    return false
  }

  // ---- 编辑权限 ----
  function canEdit() {
    if (isMember.value) return true
    if (isExpired.value) return false
    return true
  }

  return {
    // 试用
    remainingDays,
    isExpired,
    // 会员
    phoneNumber,
    memberExpire,
    isMember,
    memberExpireDate,
    memberDaysLeft,
    isEarlyBird,
    memberPrice,
    // 激活
    activateByCode,
    verifyCodeSimple,
    canEdit,
    TRIAL_DAYS,
    MEMBER_PRICE_NORMAL,
    MEMBER_PRICE_EARLY,
    EARLY_BIRD_LIMIT,
  }
})
