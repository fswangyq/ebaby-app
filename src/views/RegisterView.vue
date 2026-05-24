<template>
  <div class="register-page">
    <!-- 顶部 -->
    <div class="page-header">
      <van-icon name="arrow-left" class="back-btn" size="20" @click="router.back()" />
      <h2>🩺 会员办理</h2>
      <p>激活年会员，解锁全部功能</p>
    </div>

    <div class="register-body">
      <!-- ===== 已注册会员 ===== -->
      <div v-if="store.isMember" class="member-card">
        <div class="member-badge">✅ 您已是会员</div>
        <div class="member-info">
          <div class="info-row">
            <span class="info-label">手机号</span>
            <span class="info-value">{{ store.phoneNumber }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">会员到期日</span>
            <span class="info-value expire">{{ store.memberExpireDate }}</span>
          </div>
        </div>
        <!-- 会员权利倒计时 -->
        <div class="countdown-card member-cd">
          <div class="countdown-label">🕐 会员权利有效期倒计时</div>
          <div class="countdown-grid">
            <div class="countdown-item">
              <span class="cd-num">{{ countdown.days }}</span>
              <span class="cd-label">天</span>
            </div>
            <span class="cd-sep">:</span>
            <div class="countdown-item">
              <span class="cd-num">{{ String(countdown.hours).padStart(2, '0') }}</span>
              <span class="cd-label">时</span>
            </div>
            <span class="cd-sep">:</span>
            <div class="countdown-item">
              <span class="cd-num">{{ String(countdown.minutes).padStart(2, '0') }}</span>
              <span class="cd-label">分</span>
            </div>
            <span class="cd-sep">:</span>
            <div class="countdown-item">
              <span class="cd-num">{{ String(countdown.seconds).padStart(2, '0') }}</span>
              <span class="cd-label">秒</span>
            </div>
          </div>
        </div>
        <button class="act-btn primary full" @click="router.push('/')">进入首页</button>
      </div>

      <!-- ===== 未注册：办卡流程 ===== -->
      <div v-else class="form-area">
        <!-- 价格卡片 -->
        <div class="price-card">
          <div class="price-original">
            <span class="price-strikethrough">¥50/年</span>
          </div>
          <div class="price-current">
            <span class="price-symbol">¥</span>
            <span class="price-num">20</span>
            <span class="price-unit">/年</span>
          </div>
          <div class="price-badge">🔥 限时优惠</div>
          <div class="price-desc">前100名专享，原价50元/年</div>
        </div>

        <!-- 手机号输入 -->
        <div class="field-card">
          <label class="field-label">📱 手机号</label>
          <div class="field-input-wrap">
            <input
              v-model="phone"
              type="tel"
              maxlength="11"
              placeholder="请输入11位手机号"
              class="field-input"
              @input="onPhoneInput"
            />
            <span v-if="phoneValid" class="field-ok">✓</span>
          </div>
          <p v-if="phoneTouched && phone && !phoneValid" class="field-error">请输入正确的11位手机号</p>
        </div>

        <!-- 办理会员按钮 -->
        <button
          class="pay-btn"
          :disabled="!phoneValid"
          @click="showPayModal = true"
        >
          💳 办理会员（¥20/年）
        </button>

        <!-- 已有注册码？ -->
        <div class="has-code-link" @click="showCodeInput = !showCodeInput">
          {{ showCodeInput ? '收起 ↑' : '已有注册码？直接激活 →' }}
        </div>

        <!-- 注册码手动输入（折叠） -->
        <div v-if="showCodeInput" class="code-card">
          <div class="field-input-wrap">
            <input
              v-model="codeDisplay"
              type="text"
              maxlength="17"
              placeholder="EB-XXXX-XXXX-XXXX"
              class="field-input code-input"
              @input="onCodeInput"
            />
            <button class="paste-btn" @click="pasteCode">粘贴</button>
          </div>
          <p v-if="codeDisplay && !codeFormatOk" class="field-error">格式：EB- 开头，共14位字母数字</p>
          <button
            class="act-btn primary full"
            :disabled="!canSubmit"
            @click="doActivate"
            style="margin-top:10px;"
          >
            {{ activating ? '激活中…' : '激活会员' }}
          </button>
          <div v-if="resultMsg" :class="['result-msg', resultOk ? 'ok' : 'err']">
            {{ resultMsg }}
          </div>
        </div>

        <!-- 试用提示 -->
        <div v-if="!store.isMember" class="trial-hint">
          💡 您还可以试用 <strong>{{ store.remainingDays }}</strong> 天
          <span v-if="store.remainingDays <= 7" class="trial-warn">（即将到期，请尽快激活）</span>
        </div>
      </div>
    </div>

    <!-- ===== 付款弹窗 ===== -->
    <van-overlay :show="showPayModal" @click="showPayModal = false" z-index="100" />
    <div v-if="showPayModal" class="pay-modal">
      <div class="pay-modal-card">
        <!-- 关闭按钮 -->
        <div class="pay-modal-close" @click="showPayModal = false">✕</div>

        <!-- 已付款成功状态 -->
        <template v-if="payDone">
          <div class="pay-done-icon">✅</div>
          <div class="pay-done-title">激活成功！</div>
          <div class="pay-done-code-label">您的注册码</div>
          <div class="pay-done-code">{{ generatedCode }}</div>
          <div class="pay-done-info">
            <div>手机号：{{ phone }}</div>
            <div>有效期至：{{ new Date(Date.now() + 365*86400000).toLocaleDateString('zh-CN') }}</div>
          </div>
          <!-- 会员权利倒计时 -->
          <div class="countdown-card">
            <div class="countdown-label">🕐 会员权利有效期倒计时</div>
            <div class="countdown-grid">
              <div class="countdown-item">
                <span class="cd-num">{{ countdown.days }}</span>
                <span class="cd-label">天</span>
              </div>
              <span class="cd-sep">:</span>
              <div class="countdown-item">
                <span class="cd-num">{{ String(countdown.hours).padStart(2, '0') }}</span>
                <span class="cd-label">时</span>
              </div>
              <span class="cd-sep">:</span>
              <div class="countdown-item">
                <span class="cd-num">{{ String(countdown.minutes).padStart(2, '0') }}</span>
                <span class="cd-label">分</span>
              </div>
              <span class="cd-sep">:</span>
              <div class="countdown-item">
                <span class="cd-num">{{ String(countdown.seconds).padStart(2, '0') }}</span>
                <span class="cd-label">秒</span>
              </div>
            </div>
          </div>
          <button class="copy-btn" @click="copyCode">📋 复制注册码</button>
          <p class="copy-tip" v-if="copied">已复制到剪贴板！</p>
          <button class="act-btn primary full" @click="finishPay">完成，进入首页</button>
        </template>

        <!-- 付款中状态 -->
        <template v-else>
          <div class="pay-modal-title">扫码付款</div>
          <div class="pay-modal-price">
            <span class="pay-modal-original">¥50</span>
            <span class="pay-modal-arrow">→</span>
            <span class="pay-modal-now">¥20</span>
          </div>
          <div class="pay-modal-subtitle">限时优惠 · 1年会员</div>

          <!-- 二维码占位区 -->
          <div class="qr-area">
            <div class="qr-placeholder">
              <div class="qr-icon">📱</div>
              <div class="qr-text">请替换为您的<br/>微信/支付宝收款码</div>
              <div class="qr-hint">建议尺寸：300×300px</div>
            </div>
          </div>

          <div class="pay-steps">
            <div class="pay-step">
              <span class="step-num">1</span>
              <span>使用微信或支付宝扫描上方二维码</span>
            </div>
            <div class="pay-step">
              <span class="step-num">2</span>
              <span>付款 <strong>¥20.00</strong>（备注手机号 {{ phone || '___' }}）</span>
            </div>
            <div class="pay-step">
              <span class="step-num">3</span>
              <span>付款后点击下方按钮，系统自动激活</span>
            </div>
          </div>

          <button class="paid-btn" @click="handlePaid">
            ✅ 我已完成付款，立即激活
          </button>
          <p class="paid-note">点击后系统将自动为您生成注册码并激活会员</p>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useTrialStore } from '../store/useTrialStore'
import { showToast } from 'vant'

const store = useTrialStore()
const router = useRouter()

const phone = ref('')
const codeDisplay = ref('')
const phoneTouched = ref(false)
const activating = ref(false)
const resultMsg = ref('')
const resultOk = ref(false)
const showPayModal = ref(false)
const showCodeInput = ref(false)
const payDone = ref(false)
const generatedCode = ref('')
const copied = ref(false)

// ===== 会员倒计时 =====
const countdown = ref({ days: 0, hours: 0, minutes: 0, seconds: 0 })
let countdownTimer = null

function startCountdown(expireTs) {
  stopCountdown()
  function tick() {
    const now = Date.now()
    const left = Math.max(0, expireTs - now)
    countdown.value = {
      days: Math.floor(left / 86400000),
      hours: Math.floor((left % 86400000) / 3600000),
      minutes: Math.floor((left % 3600000) / 60000),
      seconds: Math.floor((left % 60000) / 1000),
    }
  }
  tick()
  countdownTimer = setInterval(tick, 1000)
}

function stopCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
}

onMounted(() => {
  if (store.isMember) {
    startCountdown(store.memberExpire)
  }
})

onUnmounted(() => {
  stopCountdown()
})

const phoneValid = computed(() => /^1[3-9]\d{9}$/.test(phone.value.replace(/\s/g, '')))
const codeClean = computed(() => codeDisplay.value.replace(/-/g, '').toUpperCase())
const codeFormatOk = computed(() => /^EB[A-Z0-9]{12}$/.test('EB' + codeClean.value.replace(/^EB/, '')))
const canSubmit = computed(() => phoneValid.value && codeClean.value.length >= 12 && !activating.value)

function onPhoneInput() {
  phoneTouched.value = true
  phone.value = phone.value.replace(/[^\d]/g, '')
}

function onCodeInput() {
  let v = codeDisplay.value.replace(/[^A-Za-z0-9]/g, '').toUpperCase()
  if (v.startsWith('EB')) v = v.slice(2)
  const parts = []
  for (let i = 0; i < v.length && i < 12; i += 4) {
    parts.push(v.slice(i, i + 4))
  }
  codeDisplay.value = 'EB-' + parts.join('-')
}

async function pasteCode() {
  try {
    const text = await navigator.clipboard.readText()
    codeDisplay.value = text.trim()
    onCodeInput()
    showToast('已粘贴')
  } catch (e) {
    showToast('请手动输入注册码')
  }
}

async function doActivate() {
  if (!canSubmit.value) return
  activating.value = true
  resultMsg.value = ''

  const code = codeDisplay.value.trim()
  const result = await store.activateByCode(phone.value.trim(), code)

  activating.value = false
  resultOk.value = result.ok
  if (result.ok) {
    resultMsg.value = `🎉 激活成功！会员有效期至 ${result.expireDate}`
    showToast('激活成功！')
    setTimeout(() => location.reload(), 1500)
  } else {
    resultMsg.value = `❌ 激活失败：${result.msg}`
    showToast(result.msg)
  }
}

// ===== 付款流程：模拟收款后自动生成注册码 =====
async function handlePaid() {
  if (!phoneValid.value) return
  payDone.value = true

  // 生成注册码（与 code-generator.mjs 使用相同算法）
  const code = await generateCodeForPhone(phone.value.trim())
  generatedCode.value = code

  // 自动激活
  const result = await store.activateByCode(phone.value.trim(), code)
  if (!result.ok) {
    showToast('激活异常：' + result.msg)
  }
  // 启动倒计时
  const expireTs = Date.now() + 365 * 86400000
  startCountdown(expireTs)
}

async function generateCodeForPhone(phone) {
  const SECRET_KEY = '_ebaby_2026_secret_key_@x8f3k9m'
  const timestamp = Math.floor(Date.now() / 86400000) * 86400000

  // 获取当前序号
  let seq = parseInt(localStorage.getItem('eb_member_seq') || '0') + 1
  localStorage.setItem('eb_member_seq', seq.toString())

  const msg = `${phone}|${timestamp}|${seq}`
  const encoder = new TextEncoder()
  const keyData = encoder.encode(SECRET_KEY)
  const msgData = encoder.encode(msg)

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sigBuf = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const arr = Array.from(new Uint8Array(sigBuf))
  const hex = arr.map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 20)
  const big = BigInt('0x' + hex)
  const raw = big.toString(36).toUpperCase().padStart(12, '0')

  // 格式化为 EB-XXXX-XXXX-XXXX
  return 'EB-' + raw.slice(0, 4) + '-' + raw.slice(4, 8) + '-' + raw.slice(8, 12)
}

async function copyCode() {
  try {
    await navigator.clipboard.writeText(generatedCode.value)
    copied.value = true
    showToast('注册码已复制')
  } catch (e) {
    showToast('复制失败，请手动复制')
  }
}

function finishPay() {
  showPayModal.value = false
  location.reload()
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: #faf6f0;
  padding-bottom: 40px;
}
.page-header {
  background: linear-gradient(135deg, #c4a265 0%, #a07840 100%);
  color: #fff;
  padding: 12px 16px 20px;
  border-radius: 0 0 20px 20px;
}
.back-btn {
  cursor: pointer; margin-bottom: 6px; vertical-align: middle;
}
.page-header h2 { font-size: 18px; margin: 4px 0; }
.page-header p { font-size: 12px; opacity: 0.85; margin: 0; }

.register-body {
  max-width: 460px;
  margin: 0 auto;
  padding: 16px;
}

/* ===== 已注册卡片 ===== */
.member-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  text-align: center;
}
.member-badge {
  display: inline-block;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: #fff;
  padding: 6px 18px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 16px;
}
.member-info {
  text-align: left;
  margin-bottom: 16px;
}
.info-row {
  display: flex;
  justify-content: space-between;
  padding: 10px 0;
  border-bottom: 1px solid #f0ebe3;
}
.info-label { color: #999; font-size: 13px; }
.info-value { font-weight: 700; color: #4a3728; font-size: 14px; }
.info-value.expire { color: #d46b08; }

/* ===== 价格卡片 ===== */
.form-area {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.price-card {
  background: linear-gradient(135deg, #fffdf8 0%, #fff7e6 100%);
  border: 2px solid #ffd591;
  border-radius: 16px;
  padding: 24px 20px;
  text-align: center;
  box-shadow: 0 2px 12px rgba(212, 107, 8, 0.10);
}
.price-original {
  margin-bottom: 4px;
}
.price-strikethrough {
  font-size: 16px;
  color: #bbb;
  text-decoration: line-through;
}
.price-current {
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 2px;
  margin: 6px 0;
}
.price-symbol {
  font-size: 24px;
  font-weight: 800;
  color: #d46b08;
}
.price-num {
  font-size: 48px;
  font-weight: 900;
  color: #d46b08;
  line-height: 1;
  font-family: 'DIN', 'Helvetica Neue', sans-serif;
}
.price-unit {
  font-size: 16px;
  color: #d46b08;
  font-weight: 700;
}
.price-badge {
  display: inline-block;
  background: linear-gradient(135deg, #ff4d4f, #ff7875);
  color: #fff;
  padding: 3px 14px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  margin: 8px 0;
  animation: badge-pulse 2s infinite;
}
@keyframes badge-pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}
.price-desc {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

/* ===== 手机号字段 ===== */
.field-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.field-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #4a3728;
  margin-bottom: 8px;
}
.field-input-wrap {
  display: flex;
  align-items: center;
  border: 1.5px solid #e8dfd5;
  border-radius: 10px;
  padding: 0 12px;
  background: #fffdf8;
  transition: border-color 0.2s;
}
.field-input-wrap:focus-within { border-color: #c4a265; }
.field-input {
  flex: 1;
  border: none;
  background: transparent;
  padding: 12px 0;
  font-size: 16px;
  color: #4a3728;
  outline: none;
  font-family: inherit;
  letter-spacing: 1px;
}
.code-input { font-family: 'Courier New', monospace; letter-spacing: 1.5px; font-size: 14px; }
.field-ok { color: #52c41a; font-weight: 700; margin-left: 8px; font-size: 18px; }
.paste-btn {
  background: #f8f4ee;
  border: 1px solid #e8dfd5;
  border-radius: 8px;
  padding: 5px 12px;
  font-size: 12px;
  color: #8c7853;
  cursor: pointer;
  white-space: nowrap;
}
.field-error { color: #ff4d4f; font-size: 12px; margin: 4px 0 0; }

/* ===== 付款按钮 ===== */
.pay-btn {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-radius: 14px;
  background: linear-gradient(135deg, #d46b08 0%, #f5a623 100%);
  color: #fff;
  font-size: 17px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 2px;
  box-shadow: 0 4px 16px rgba(212, 107, 8, 0.3);
  transition: all 0.2s;
}
.pay-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 107, 8, 0.4); }
.pay-btn:active:not(:disabled) { transform: scale(0.97); }
.pay-btn:disabled { background: #ddd; color: #999; cursor: not-allowed; box-shadow: none; }

/* ===== 已有注册码链接 ===== */
.has-code-link {
  text-align: center;
  font-size: 13px;
  color: #8c7853;
  cursor: pointer;
  padding: 8px 0;
  transition: color 0.2s;
}
.has-code-link:hover { color: #d46b08; }

/* ===== 手动输入注册码卡片 ===== */
.code-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}

/* ===== 付款弹窗 ===== */
.pay-modal {
  position: fixed;
  inset: 0;
  z-index: 101;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}
.pay-modal-card {
  background: #fff;
  border-radius: 20px;
  padding: 28px 20px 24px;
  width: 100%;
  max-width: 380px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 12px 48px rgba(0,0,0,0.2);
  position: relative;
  animation: modal-in 0.3s ease;
}
@keyframes modal-in {
  from { opacity: 0; transform: translateY(30px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
.pay-modal-close {
  position: absolute;
  top: 12px;
  right: 16px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 16px;
  color: #999;
  cursor: pointer;
  transition: all 0.2s;
}
.pay-modal-close:hover { background: #e8e8e8; color: #333; }

.pay-modal-title {
  font-size: 18px;
  font-weight: 700;
  color: #4a3728;
  text-align: center;
  margin-bottom: 8px;
}
.pay-modal-price {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-bottom: 4px;
}
.pay-modal-original {
  font-size: 20px;
  color: #bbb;
  text-decoration: line-through;
}
.pay-modal-arrow {
  font-size: 18px;
  color: #d46b08;
}
.pay-modal-now {
  font-size: 36px;
  font-weight: 900;
  color: #d46b08;
  font-family: 'DIN', 'Helvetica Neue', sans-serif;
}
.pay-modal-subtitle {
  text-align: center;
  font-size: 13px;
  color: #ff7875;
  font-weight: 600;
  margin-bottom: 16px;
}

/* ===== 二维码占位 ===== */
.qr-area {
  display: flex;
  justify-content: center;
  margin-bottom: 16px;
}
.qr-placeholder {
  width: 200px;
  height: 200px;
  border: 2px dashed #d4c5a9;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #fffdf8;
  gap: 8px;
}
.qr-icon {
  font-size: 40px;
  opacity: 0.5;
}
.qr-text {
  font-size: 12px;
  color: #999;
  text-align: center;
  line-height: 1.6;
}
.qr-hint {
  font-size: 10px;
  color: #ccc;
}

/* ===== 付款步骤 ===== */
.pay-steps {
  background: #faf6f0;
  border-radius: 12px;
  padding: 14px 16px;
  margin-bottom: 16px;
}
.pay-step {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 6px 0;
  font-size: 13px;
  color: #6b5a48;
  line-height: 1.6;
}
.step-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #c4a265;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
  margin-top: 1px;
}

/* ===== 我已付款按钮 ===== */
.paid-btn {
  width: 100%;
  padding: 14px 0;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #52c41a, #389e0d);
  color: #fff;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
  transition: all 0.2s;
}
.paid-btn:hover { transform: translateY(-2px); }
.paid-btn:active { transform: scale(0.97); }
.paid-note {
  text-align: center;
  font-size: 11px;
  color: #ccc;
  margin-top: 8px;
}

/* ===== 付款完成状态 ===== */
.pay-done-icon {
  font-size: 48px;
  text-align: center;
  margin-bottom: 12px;
}
.pay-done-title {
  font-size: 20px;
  font-weight: 800;
  color: #389e0d;
  text-align: center;
  margin-bottom: 4px;
}
.pay-done-code-label {
  text-align: center;
  font-size: 13px;
  color: #999;
  margin: 12px 0 6px;
}
.pay-done-code {
  background: #f6ffed;
  border: 2px solid #b7eb8f;
  border-radius: 12px;
  padding: 14px;
  text-align: center;
  font-size: 22px;
  font-weight: 900;
  font-family: 'Courier New', monospace;
  color: #389e0d;
  letter-spacing: 2px;
  margin-bottom: 12px;
  user-select: all;
}
.pay-done-info {
  background: #faf6f0;
  border-radius: 10px;
  padding: 12px 16px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #6b5a48;
  line-height: 1.8;
}

/* ===== 会员倒计时卡片 ===== */
.countdown-card {
  background: linear-gradient(135deg, #fff7e6, #fffdf8);
  border: 1.5px solid #ffd591;
  border-radius: 14px;
  padding: 14px 16px;
  margin-bottom: 14px;
  text-align: center;
}
.countdown-card.member-cd {
  margin: 0 0 16px;
}
.countdown-label {
  font-size: 13px;
  font-weight: 600;
  color: #d46b08;
  margin-bottom: 10px;
}
.countdown-grid {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.countdown-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 52px;
}
.cd-num {
  font-size: 28px;
  font-weight: 900;
  color: #4a3728;
  font-family: 'DIN', 'Courier New', monospace;
  line-height: 1.2;
  background: #fff;
  border-radius: 8px;
  padding: 4px 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.08);
}
.cd-label {
  font-size: 11px;
  color: #999;
  margin-top: 2px;
}
.cd-sep {
  font-size: 20px;
  color: #d46b08;
  font-weight: 700;
  margin-top: -14px;
}
.copy-btn {
  width: 100%;
  padding: 10px 0;
  border: 2px solid #b7eb8f;
  border-radius: 10px;
  background: #fff;
  color: #389e0d;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 4px;
}
.copy-btn:hover { background: #f6ffed; }
.copy-tip {
  text-align: center;
  font-size: 12px;
  color: #52c41a;
  margin: 4px 0 8px;
}

/* ===== 激活结果 ===== */
.result-msg {
  text-align: center;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 13px;
  margin-top: 8px;
}
.result-msg.ok { background: #f6ffed; color: #389e0d; border: 1px solid #b7eb8f; }
.result-msg.err { background: #fff2f0; color: #ff4d4f; border: 1px solid #ffccc7; }

/* ===== 试用提示 ===== */
.trial-hint {
  text-align: center;
  font-size: 12px;
  color: #999;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.04);
}
.trial-warn { color: #ff4d4f; font-weight: 600; }

/* ===== 通用按钮 ===== */
.act-btn {
  display: block;
  width: 100%;
  padding: 12px 0;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  letter-spacing: 1px;
  transition: all 0.2s;
}
.act-btn.primary {
  background: linear-gradient(135deg, #8c7853, #a08860);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139, 119, 86, 0.25);
}
.act-btn.primary:hover { background: linear-gradient(135deg, #7a6745, #8c7853); }
.act-btn.primary:active { transform: scale(0.97); }
.act-btn:disabled { background: #ddd; color: #999; cursor: not-allowed; box-shadow: none; }
.act-btn.full { width: 100%; }
</style>
