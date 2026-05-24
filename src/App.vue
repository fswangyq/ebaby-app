<template>
  <div id="app">
    <!-- PWA 安装提示条 -->
    <div v-if="showInstallBanner" class="install-banner">
      <span>📲 添加到手机桌面，使用更方便</span>
      <span class="install-btn" @click="installPwa">立即安装</span>
      <span class="install-close" @click="showInstallBanner = false">✕</span>
    </div>

    <!-- 会员状态条（未注册时显示试用剩余） -->
    <div v-if="!trialStore.isMember" class="member-bar trial">
      <span>⏳ 试用期剩余 <b>{{ trialStore.remainingDays }}</b> 天</span>
      <span class="bar-action" @click="$router.push('/register')">激活年会员（¥{{ trialStore.memberPrice }}/年）</span>
    </div>
    <div v-else class="member-bar active">
      <span>✅ 年会员（至 {{ trialStore.memberExpireDate }}，剩余 {{ trialStore.memberDaysLeft }} 天）</span>
      <span class="bar-action" @click="$router.push('/register')">查看</span>
    </div>

    <!-- 试用到期 → 跳转注册页 -->
    <router-view v-if="!trialStore.isExpired || trialStore.isMember" />
    <RegisterView v-else />

    <!-- 注册码输入弹窗（会员页/结果页可触发） -->
    <van-dialog v-model:show="showCodeDialog" title="激活年会员" show-cancel-button @confirm="handleVerifyCode">
      <div style="padding:16px;">
        <p style="font-size:13px;color:#888;margin-bottom:12px;">请输入注册码，格式：EB-XXXX-XXXX-XXXX</p>
        <van-field v-model="inputCode" placeholder="EB-XXXX-XXXX-XXXX" maxlength="19" clearable />
        <p v-if="codeError" style="font-size:12px;color:#ee0a24;margin-top:8px;">注册码格式错误或无效，请重新输入</p>
        <p v-if="codeSuccess" style="font-size:12px;color:#07c160;margin-top:8px;">激活成功！感谢您的购买！</p>
      </div>
    </van-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted, shallowRef } from 'vue'
import { useTrialStore } from './store/useTrialStore'

const trialStore = useTrialStore()
const RegisterView = shallowRef(null)
import('./views/RegisterView.vue').then(m => RegisterView.value = m.default)

const showCodeDialog = ref(false)
const inputCode = ref('')
const codeError = ref(false)
const codeSuccess = ref(false)

// PWA 安装相关
const showInstallBanner = ref(false)
let deferredPrompt = null

onMounted(() => {
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone

  if (!isStandalone) {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      deferredPrompt = e
      setTimeout(() => { showInstallBanner.value = true }, 3000)
    })
    window.addEventListener('appinstalled', () => {
      showInstallBanner.value = false
      deferredPrompt = null
    })
  }
})

function installPwa() {
  if (deferredPrompt) {
    deferredPrompt.prompt()
    deferredPrompt.userChoice.then(() => {
      deferredPrompt = null
      showInstallBanner.value = false
    })
  } else {
    alert('请使用 Safari 浏览器打开，然后点击底部"分享"按钮 → "添加到主屏幕"')
  }
}

function handleVerifyCode() {
  codeError.value = false
  codeSuccess.value = false
  if (!inputCode.value) {
    codeError.value = true
    return
  }
  // 调用简单校验（兼容无手机号的老码）
  const ok = trialStore.verifyCodeSimple(inputCode.value)
  if (ok) {
    codeSuccess.value = true
    inputCode.value = ''
    setTimeout(() => { showCodeDialog.value = false }, 1500)
  } else {
    codeError.value = true
  }
}
</script>

<style>
/* ===== 全局样式覆盖 ===== */
#app {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC',
    'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}

/* ===== PWA 安装条 ===== */
.install-banner {
  background: linear-gradient(135deg, #07c160, #06ad56);
  color: #fff;
  font-size: 13px;
  padding: 10px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 101;
  box-shadow: 0 1px 3px rgba(0,0,0,0.15);
  animation: slideDown 0.3s ease;
}
@keyframes slideDown {
  from { transform: translateY(-100%); }
  to   { transform: translateY(0); }
}
.install-btn {
  background: #fff;
  color: #07c160;
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 12px;
  cursor: pointer;
  white-space: nowrap;
  margin-left: 8px;
}
.install-close {
  font-size: 16px;
  padding: 2px 6px;
  cursor: pointer;
  opacity: 0.8;
  margin-left: 4px;
}

/* ===== 会员状态条 ===== */
.member-bar {
  font-size: 13px;
  padding: 6px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: sticky;
  top: 0;
  z-index: 100;
}
.member-bar.trial {
  background: #fff7e6;
  color: #d48806;
  border-bottom: 1px solid #ffe58f;
}
.member-bar.active {
  background: #f6ffed;
  color: #389e0d;
  border-bottom: 1px solid #b7eb8f;
}
.bar-action {
  background: #8c7853;
  color: #fff;
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  cursor: pointer;
}
.member-bar.active .bar-action {
  background: #52c41a;
}
</style>
