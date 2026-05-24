<template>
  <div class="expired-page">
    <div class="icon-area">
      <div class="lock-icon">🔒</div>
      <h2>试用期已结束</h2>
      <p>您已使用30天免费试用，部分功能已受限。</p>
    </div>

    <div class="limit-list">
      <h3>当前受限功能：</h3>
      <div class="limit-item">❌ 新增/编辑药品（药库只能查看）</div>
      <div class="limit-item">❌ 拍照录入药品</div>
      <div class="limit-item">✅ 辨症查询（仍可正常使用）</div>
      <div class="limit-item">✅ 科普阅读文章（仍可正常浏览）</div>
    </div>

    <div class="action-area">
      <h3>解锁完整功能</h3>
      <p>购买注册码后，输入即可解锁全部功能，永久有效。</p>
      <van-field v-model="inputCode" placeholder="请输入注册码（格式：EB-XXXX-XXXX-XXXX）" style="margin:12px 0;" />
      <van-button type="primary" block round size="large" @click="handleVerify">验证注册码</van-button>
      <p class="contact-tip">购买注册码请联系客服或访问官网（此处替换为您的购买链接）</p>
    </div>

    <div style="height:20px;"></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTrialStore } from '../store/useTrialStore'
import { showToast } from 'vant'

const trialStore = useTrialStore()
const inputCode = ref('')
const showSuccess = ref(false)

function handleVerify() {
  if (!inputCode.value) {
    showToast('请输入注册码')
    return
  }
  const ok = trialStore.verifyCode(inputCode.value)
  if (ok) {
    showToast('激活成功！')
    setTimeout(() => { location.href = '/' }, 1000)
  } else {
    showToast('注册码无效，请重新输入')
  }
}
</script>

<style scoped>
.expired-page { background: #f5f5f5; min-height: 100vh; padding: 0 12px; }
.icon-area { text-align: center; padding: 40px 16px 20px; }
.lock-icon { font-size: 64px; margin-bottom: 16px; }
.icon-area h2 { font-size: 20px; color: #333; margin: 0 0 8px; }
.icon-area p { font-size: 13px; color: #888; margin: 0; }

.limit-list {
  background: #fff; border-radius: 12px; padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); margin-bottom: 12px;
}
.limit-list h3 { font-size: 14px; color: #333; margin: 0 0 12px; }
.limit-item { font-size: 13px; color: #555; padding: 6px 0; border-bottom: 1px solid #f0f0f0; }
.limit-item:last-child { border-bottom: none; }

.action-area {
  background: #fff; border-radius: 12px; padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.action-area h3 { font-size: 14px; color: #4fc08d; margin: 0 0 8px; }
.action-area p { font-size: 12px; color: #888; line-height: 1.8; }
.contact-tip { font-size: 11px; color: #bbb; margin-top: 12px; }
</style>
