<template>
  <div class="diagnose-wrap">
    <!-- 顶部进度条 -->
    <div class="progress-bar">
      <div
        class="progress-fill"
        :style="{ width: progressPct + '%' }"
      ></div>
      <div class="progress-text">
        {{ currentStepIndex + 1 }} / {{ totalSteps }}
        <span class="progress-label">· 辨症查药</span>
      </div>
    </div>

    <!-- 快捷导航 -->
    <div class="top-nav">
      <button class="top-nav-btn" @click="$router.push('/medicine')">
        <span>💊</span> 药库
      </button>
      <button class="top-nav-btn" @click="$router.push('/knowledge')">
        <span>📚</span> 知识库
      </button>
      <button class="top-nav-btn" @click="$router.push('/')">
        <span>🏠</span> 首页
      </button>
    </div>

    <!-- 快捷辨证入口（仅第0步显示） -->
    <div v-if="currentStepIndex === 0" class="quick-entry">
      <div class="quick-title">—— 常见证型快捷入口 ——</div>
      <div class="quick-grid">
        <button
          v-for="qp in quickPatterns"
          :key="qp.id"
          class="quick-card"
          @click="applyQuickPattern(qp)"
        >
          <span class="quick-icon">{{ qp.icon }}</span>
          <span class="quick-label">{{ qp.label }}</span>
          <span class="quick-desc">{{ qp.desc }}</span>
        </button>
      </div>
      <div class="quick-divider">
        <span>—— 或逐题辨证 ——</span>
      </div>
    </div>

    <!-- 问题卡片 -->
    <div class="question-card" :key="currentStep.id">
      <!-- 图标 -->
      <div class="q-icon">{{ currentStep.icon }}</div>

      <!-- 标题 -->
      <h2 class="q-title">{{ currentStep.title }}</h2>
      <p v-if="currentStep.subtitle" class="q-subtitle">{{ currentStep.subtitle }}</p>

      <!-- 选项列表 -->
      <div class="options-list">
        <button
          v-for="opt in currentStep.options"
          :key="opt.value"
          class="option-btn"
          :class="{ active: answers[currentStep.id] === opt.value }"
          @click="selectOption(opt.value)"
        >
          <span class="opt-label">{{ opt.label }}</span>
          <span v-if="opt.desc" class="opt-desc">{{ opt.desc }}</span>
          <span v-if="answers[currentStep.id] === opt.value" class="opt-check">✓</span>
        </button>
      </div>
    </div>

    <!-- 底部导航 -->
    <div class="nav-bar">
      <button
        class="nav-btn nav-back"
        :disabled="currentStepIndex === 0"
        @click="prevStep"
      >
        ← 上一步
      </button>
      <button
        v-if="currentStepIndex < totalSteps - 1"
        class="nav-btn nav-next"
        :disabled="!canGoNext"
        @click="nextStep"
      >
        下一步 →
      </button>
      <button
        v-else
        class="nav-btn nav-submit"
        :disabled="!canGoNext"
        @click="submitDiagnosis"
      >
        🩺 查看辨证结果
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { DIAGNOSIS_STEPS, QUICK_PATTERNS } from '../data/diagnosisData.js'
import { runDiagnosis } from '../data/diagnosisEngine.js'
import { medicineData } from '../data/medicineData.js'

const router = useRouter()

// —— 状态 ——
const answers = ref({})
const currentStepIndex = ref(0)
const submitting = ref(false)

// —— 计算属性 ——
const totalSteps = computed(() => DIAGNOSIS_STEPS.length)
const currentStep = computed(() => DIAGNOSIS_STEPS[currentStepIndex.value])
const progressPct = computed(() =>
  Math.round(((currentStepIndex.value + 1) / totalSteps.value) * 100)
)
const canGoNext = computed(() => {
  const val = answers.value[currentStep.value.id]
  return val !== undefined && val !== null && val !== ''
})

// 过滤步骤：触发式问题（如fever_level只在main_symptom=fever时显示）
const activeSteps = computed(() => {
  return DIAGNOSIS_STEPS.filter(step => {
    if (!step.triggerValue) return true
    return answers.value['main_symptom'] === step.triggerValue
  })
})

// 当前在activeSteps中的索引
const activeStepIndex = computed(() => {
  return activeSteps.value.findIndex(s => s.id === currentStep.value.id)
})

// —— 方法 ——
function selectOption(value) {
  answers.value[currentStep.value.id] = value
  // 触发响应式
  answers.value = { ...answers.value }
}

function nextStep() {
  if (!canGoNext.value) return
  // 跳过不活跃的步骤
  let next = currentStepIndex.value + 1
  while (next < DIAGNOSIS_STEPS.length) {
    const step = DIAGNOSIS_STEPS[next]
    if (!step.triggerValue) break
    if (answers.value['main_symptom'] === step.triggerValue) break
    next++
  }
  currentStepIndex.value = next
}

function prevStep() {
  if (currentStepIndex.value <= 0) return
  let prev = currentStepIndex.value - 1
  while (prev >= 0) {
    const step = DIAGNOSIS_STEPS[prev]
    if (!step.triggerValue) break
    if (answers.value['main_symptom'] === step.triggerValue) break
    prev--
  }
  currentStepIndex.value = Math.max(0, prev)
}

// 快捷辨证
function applyQuickPattern(qp) {
  answers.value = { ...answers.value, ...qp.answers }
  // 填充缺失字段为默认值
  for (const step of DIAGNOSIS_STEPS) {
    if (!answers.value[step.id]) {
      answers.value[step.id] = step.options[0]?.value || ''
    }
  }
  answers.value = { ...answers.value }
  // 跳到最后一题
  currentStepIndex.value = DIAGNOSIS_STEPS.length - 1
}

// 提交辨证
function submitDiagnosis() {
  if (submitting.value) return
  submitting.value = true

  try {
    const result = runDiagnosis(answers.value, medicineData)
    // 存到 sessionStorage 供结果页读取
    sessionStorage.setItem('ebaby_diagnosis_result', JSON.stringify(result))
    sessionStorage.setItem('ebaby_diagnosis_answers', JSON.stringify(answers.value))
    router.push('/result')
  } catch (err) {
    console.error('辨证出错：', err)
    alert('辨证过程中出错，请重试或联系开发者。')
    submitting.value = false
  }
}

onMounted(() => {
  // 读取保留的答案（如果有的话）
  const saved = sessionStorage.getItem('ebaby_diagnosis_answers')
  if (saved) {
    try {
      answers.value = JSON.parse(saved)
    } catch {}
  }
})
</script>

<style scoped>
/* ===== 页面 ===== */
.diagnose-wrap {
  min-height: 100vh;
  background: linear-gradient(170deg, #f8f4ee 0%, #f0ebe3 50%, #e8dfd5 100%);
  padding: 0 0 100px 0;
}

/* ===== 进度条 ===== */
.progress-bar {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 40px;
  background: #f8f4ee;
  border-bottom: 1px solid #e8dfd5;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.progress-fill {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  background: linear-gradient(90deg, #8c7853, #c4a265);
  border-radius: 0 4px 4px 0;
  transition: width 0.35s ease;
}
.progress-text {
  position: relative;
  z-index: 1;
  font-size: 13px;
  color: #8c7853;
  font-weight: 600;
}
.progress-label {
  color: #b5a48a;
  font-weight: 400;
}

/* ===== 顶部快捷导航 ===== */
.top-nav {
  display: flex;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px 0;
  max-width: 460px;
  margin: 0 auto;
}
.top-nav-btn {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px 12px;
  border: 1px solid #e8dfd5;
  border-radius: 16px;
  background: #fffdf8;
  color: #8c7853;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.top-nav-btn:hover {
  border-color: #c4a265;
  background: #f8f4ee;
}

/* ===== 快捷入口 ===== */
.quick-entry {
  padding: 24px 16px 0;
  max-width: 460px;
  margin: 0 auto;
}
.quick-title {
  text-align: center;
  font-size: 13px;
  color: #b5a48a;
  letter-spacing: 2px;
  margin-bottom: 14px;
}
.quick-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}
.quick-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 14px 8px;
  border: 1.5px solid #e8dfd5;
  border-radius: 14px;
  background: #fffdf8;
  cursor: pointer;
  transition: all 0.2s ease;
}
.quick-card:hover {
  border-color: #c4a265;
  background: #f8f4ee;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(139,119,86,0.10);
}
.quick-card:active { transform: scale(0.97); }
.quick-icon { font-size: 26px; }
.quick-label {
  font-size: 14px;
  font-weight: 700;
  color: #4a3728;
}
.quick-desc {
  font-size: 11px;
  color: #8c7853;
  text-align: center;
  line-height: 1.4;
}
.quick-divider {
  text-align: center;
  font-size: 12px;
  color: #c4b99a;
  margin-top: 20px;
  letter-spacing: 1px;
}

/* ===== 问题卡片 ===== */
.question-card {
  max-width: 460px;
  margin: 24px auto 0;
  padding: 0 16px;
  animation: fadeSlideIn 0.3s ease-out;
}
@keyframes fadeSlideIn {
  from { opacity: 0; transform: translateY(12px); }
  to   { opacity: 1; transform: translateY(0); }
}
.q-icon {
  text-align: center;
  font-size: 44px;
  margin-bottom: 10px;
}
.q-title {
  text-align: center;
  font-size: 20px;
  font-weight: 800;
  color: #4a3728;
  margin: 0 0 6px;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.q-subtitle {
  text-align: center;
  font-size: 13px;
  color: #8c7853;
  margin: 0 0 20px;
  line-height: 1.5;
}

/* ===== 选项按钮 ===== */
.options-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.option-btn {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 2px;
  width: 100%;
  padding: 14px 18px;
  border: 2px solid #e8dfd5;
  border-radius: 14px;
  background: #fffdf8;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  position: relative;
}
.option-btn:hover {
  border-color: #c4a265;
  background: #f8f4ee;
}
.option-btn.active {
  border-color: #8c7853;
  background: linear-gradient(135deg, #f8f4ee, #f0ebe3);
  box-shadow: 0 2px 8px rgba(139,119,86,0.12);
}
.opt-label {
  font-size: 15px;
  font-weight: 700;
  color: #4a3728;
}
.opt-desc {
  font-size: 12px;
  color: #8c7853;
  line-height: 1.4;
}
.opt-check {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px; height: 24px;
  border-radius: 50%;
  background: linear-gradient(135deg, #8c7853, #c4a265);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

/* ===== 底部导航 ===== */
.nav-bar {
  position: fixed;
  bottom: 0;
  left: 0; right: 0;
  z-index: 100;
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(0deg, #f8f4ee 80%, transparent 100%);
  border-top: 1px solid #e8dfd5;
}
.nav-btn {
  flex: 1;
  padding: 14px 0;
  border: none;
  border-radius: 14px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
}
.nav-back {
  background: #fffdf8;
  color: #8c7853;
  border: 1.5px solid #e8dfd5;
  flex: 0.8;
}
.nav-back:disabled { opacity: 0.35; cursor: not-allowed; }
.nav-back:hover:not(:disabled) {
  border-color: #c4a265;
  background: #f8f4ee;
}
.nav-next {
  background: linear-gradient(135deg, #8c7853, #a88c5e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139,119,86,0.20);
}
.nav-next:disabled { opacity: 0.4; cursor: not-allowed; }
.nav-next:hover:not(:disabled) { transform: scale(1.02); }
.nav-submit {
  background: linear-gradient(135deg, #d46b08, #f5a623);
  color: #fff;
  box-shadow: 0 4px 16px rgba(212,107,8,0.25);
  font-size: 16px;
}
.nav-submit:disabled { opacity: 0.4; cursor: not-allowed; }
.nav-submit:hover:not(:disabled) { transform: scale(1.02); }
</style>
