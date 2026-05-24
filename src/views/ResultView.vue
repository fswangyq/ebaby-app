<template>
  <div class="result-wrap">
    <!-- 安全红线弹窗 -->
    <div v-if="redFlags.length > 0" class="red-flag-banner">
      <div class="red-flag-icon">⚠️</div>
      <div class="red-flag-content">
        <div class="red-flag-title">请注意！以下情况建议尽快就医：</div>
        <div v-for="(f, i) in redFlags" :key="i" class="red-flag-item">
          · {{ f }}
        </div>
      </div>
    </div>

    <!-- 发热等级横幅 -->
    <div
      v-if="feverBanner"
      class="fever-banner"
      :style="{ background: feverGradient }"
    >
      <span class="fever-icon">{{ feverBanner.icon }}</span>
      <div class="fever-info">
        <div class="fever-label">{{ feverBanner.label }}</div>
        <div class="fever-action">{{ feverBanner.action }}</div>
      </div>
    </div>

    <!-- 辨证结果卡片 -->
    <div v-if="topPattern" class="pattern-card">
      <div class="pattern-header">
        <span class="pattern-badge" :style="{ background: topPattern.color }">
          {{ topPattern.badge }}
        </span>
        <h2 class="pattern-name">{{ topPattern.name }}</h2>
        <span class="pattern-score">匹配度 {{ topPattern.score }} 分</span>
      </div>
      <div class="pattern-desc">{{ topPattern.description }}</div>

      <!-- 辨证依据 -->
      <div v-if="topPattern.matchedRules.length > 0" class="match-rules">
        <div class="rules-title">📋 辨证依据</div>
        <div v-for="(r, i) in topPattern.matchedRules" :key="i" class="rule-item">
          <span class="rule-factor">{{ r.factor }}</span>
          <span class="rule-arrow">→</span>
          <span class="rule-value">{{ r.value }}</span>
          <span class="rule-score">+{{ r.score }}</span>
        </div>
      </div>
    </div>

    <!-- 未辨证提示 -->
    <div v-else class="no-pattern-card">
      <div class="no-pattern-icon">🤔</div>
      <div class="no-pattern-text">
        未能明确辨证，建议咨询医生或重新填写问卷。
      </div>
      <button class="retry-btn" @click="goBack">重新辨证</button>
    </div>

    <!-- 推荐药品 -->
    <div v-if="recommendations.primary" class="medicine-card">
      <div class="med-section-title">💊 推荐用药</div>

      <!-- 首选药 -->
      <div class="primary-med">
        <div class="med-rank">首选</div>
        <div class="med-name">{{ recommendations.primary.name }}</div>
        <div class="med-efficay">{{ recommendations.primary.efficay || '请参见药品说明书' }}</div>
        <div v-if="recommendations.reason" class="med-reason">
          {{ recommendations.reason }}
        </div>
      </div>

      <!-- 备选药 -->
      <div v-if="recommendations.alternatives.length > 0" class="alt-meds">
        <div class="alt-title">备选药品</div>
        <div v-for="(med, i) in recommendations.alternatives" :key="med.id" class="alt-med-item">
          <span class="alt-rank">{{ i + 2 }}.</span>
          <span class="alt-name">{{ med.name }}</span>
          <span class="alt-score">（相关度 {{ med.score }}）</span>
        </div>
      </div>
    </div>

    <!-- 分龄用量 -->
    <div v-if="ageDosage" class="dosage-card">
      <div class="med-section-title">👶 分龄用量参考</div>
      <div class="dosage-age">{{ ageDosage.label }}</div>
      <div class="dosage-note">{{ ageDosage.note }}</div>
      <div class="dosage-warn">⚠️ {{ ageDosage.warn }}</div>
    </div>

    <!-- 家中药库比对 -->
    <div v-if="homeMedicineCount > 0" class="home-meds-card">
      <div class="med-section-title">🏡 家中药库比对</div>
      <div class="home-meds-note">
        您已录入 {{ homeMedicineCount }} 种家庭药品，
        <router-link to="/medicine">前往药库查看</router-link>
      </div>
    </div>

    <!-- 安全提示 -->
    <div class="safety-card">
      <div class="med-section-title">🛡️ 安全提示</div>
      <div class="safety-item">· 本应用仅供参考，不能替代执业医师诊断</div>
      <div class="safety-item">· 服药前请仔细阅读药品说明书，核对年龄禁忌</div>
      <div class="safety-item">· 如服药 24 小时症状无改善，请及时就医</div>
      <div class="safety-item">· 婴幼儿用药建议在医生指导下进行</div>
      <div class="safety-item">· 本应用记录仅供健康管理参考，不用于临床诊断</div>
    </div>

    <!-- 底部操作 -->
    <div class="result-actions">
      <button class="act-btn act-back" @click="goBack">← 重新辨证</button>
      <button class="act-btn act-medicine" @click="goMedicine">💊 药库</button>
      <button class="act-btn act-knowledge" @click="goKnowledge">📚 知识库</button>
      <button class="act-btn act-home" @click="goHome">🏠 首页</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { FEVER_LEVELS } from '../data/diagnosisData.js'
import { useMedicineStore } from '../store/useMedicineStore.js'

const router = useRouter()
const medicineStore = useMedicineStore()

const diagnosisResult = ref(null)
const answers = ref({})

// —— 计算属性 ——
const redFlags = computed(() => diagnosisResult.value?.redFlags || [])
const feverBanner = computed(() => diagnosisResult.value?.feverBanner || null)
const topPattern = computed(() => diagnosisResult.value?.topPattern || null)
const recommendations = computed(() => diagnosisResult.value?.recommendations || {})
const ageDosage = computed(() => diagnosisResult.value?.ageDosage || null)

const homeMedicineCount = computed(() => medicineStore.medicines?.length || 0)

// 发热横幅渐变色
const feverGradient = computed(() => {
  if (!feverBanner.value) return ''
  const c = feverBanner.value.color
  return `linear-gradient(135deg, ${c}, ${c}dd)`
})

onMounted(() => {
  try {
    const saved = sessionStorage.getItem('ebaby_diagnosis_result')
    if (saved) {
      diagnosisResult.value = JSON.parse(saved)
    }
    const savedAnswers = sessionStorage.getItem('ebaby_diagnosis_answers')
    if (savedAnswers) {
      answers.value = JSON.parse(savedAnswers)
    }
  } catch (err) {
    console.error('读取辨证结果失败：', err)
  }
})

function goBack() {
  router.push('/diagnose')
}

function goHome() {
  router.push('/')
}

function goMedicine() {
  router.push('/medicine')
}

function goKnowledge() {
  router.push('/knowledge')
}
</script>

<style scoped>
/* ===== 页面 ===== */
.result-wrap {
  min-height: 100vh;
  background: linear-gradient(175deg, #f8f4ee 0%, #f0ebe3 50%, #e8dfd5 100%);
  padding: 0 0 120px 0;
}

/* ===== 安全红线 ===== */
.red-flag-banner {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  padding: 16px 18px;
  background: linear-gradient(135deg, #fff1f0, #ffece8);
  border-left: 5px solid #cf1322;
  border-bottom: 1px solid #ffa39e;
}
.red-flag-icon { font-size: 28px; flex-shrink: 0; margin-top: 2px; }
.red-flag-title { font-size: 15px; font-weight: 700; color: #cf1322; margin-bottom: 6px; }
.red-flag-item { font-size: 13px; color: #a8071a; line-height: 1.7; }

/* ===== 发热横幅 ===== */
.fever-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 18px 20px;
  color: #fff;
}
.fever-icon { font-size: 36px; flex-shrink: 0; }
.fever-label { font-size: 17px; font-weight: 800; margin-bottom: 4px; letter-spacing: 1px; }
.fever-action { font-size: 13px; opacity: 0.92; line-height: 1.6; }

/* ===== 证型卡片 ===== */
.pattern-card {
  margin: 20px 16px 0;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(139,119,86,0.10);
  padding: 20px;
  border: 1px solid #e8dfd5;
}
.pattern-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}
.pattern-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 10px;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  flex-shrink: 0;
}
.pattern-name {
  font-size: 19px;
  font-weight: 800;
  color: #4a3728;
  margin: 0;
  flex: 1;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.pattern-score {
  font-size: 12px;
  color: #8c7853;
  background: #f8f4ee;
  padding: 2px 10px;
  border-radius: 10px;
  flex-shrink: 0;
}
.pattern-desc {
  font-size: 13px;
  color: #7a6b54;
  line-height: 1.7;
  margin-bottom: 14px;
  padding-bottom: 14px;
  border-bottom: 1px dashed #e8dfd5;
}

/* ===== 辨证依据 ===== */
.match-rules {
  background: #f8f4ee;
  border-radius: 12px;
  padding: 12px 14px;
}
.rules-title {
  font-size: 13px;
  font-weight: 700;
  color: #8c7853;
  margin-bottom: 8px;
}
.rule-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #7a6b54;
  padding: 3px 0;
  line-height: 1.5;
}
.rule-factor { font-weight: 600; color: #4a3728; }
.rule-arrow { color: #c4a265; }
.rule-value { color: #8c7853; }
.rule-score { color: #d46b08; font-weight: 700; margin-left: auto; }

/* ===== 未辨证提示 ===== */
.no-pattern-card {
  margin: 40px 16px 0;
  background: #fffdf8;
  border-radius: 18px;
  padding: 32px 20px;
  text-align: center;
  border: 1px solid #e8dfd5;
}
.no-pattern-icon { font-size: 48px; margin-bottom: 12px; }
.no-pattern-text { font-size: 14px; color: #7a6b54; margin-bottom: 18px; line-height: 1.7; }
.retry-btn {
  padding: 10px 32px;
  border: none;
  border-radius: 12px;
  background: linear-gradient(135deg, #8c7853, #a88c5e);
  color: #fff;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

/* ===== 推荐药品 ===== */
.medicine-card {
  margin: 16px 16px 0;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(139,119,86,0.10);
  padding: 20px;
  border: 1px solid #e8dfd5;
}
.med-section-title {
  font-size: 16px;
  font-weight: 800;
  color: #4a3728;
  margin-bottom: 14px;
  font-family: 'STKaiti', 'KaiTi', serif;
}
.primary-med {
  background: linear-gradient(135deg, #f8f4ee, #fffdf8);
  border-radius: 14px;
  padding: 16px;
  border-left: 4px solid #8c7853;
  margin-bottom: 14px;
}
.med-rank {
  display: inline-block;
  background: linear-gradient(135deg, #8c7853, #a88c5e);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 8px;
  margin-bottom: 8px;
}
.med-name {
  font-size: 18px;
  font-weight: 800;
  color: #4a3728;
  margin-bottom: 6px;
}
.med-efficay {
  font-size: 13px;
  color: #7a6b54;
  line-height: 1.6;
  margin-bottom: 8px;
}
.med-reason {
  font-size: 12px;
  color: #8c7853;
  background: #f8f4ee;
  border-radius: 8px;
  padding: 8px 10px;
  line-height: 1.6;
  white-space: pre-line;
}

/* ===== 备选药 ===== */
.alt-meds {
  background: #f8f4ee;
  border-radius: 12px;
  padding: 12px 14px;
}
.alt-title {
  font-size: 13px;
  font-weight: 700;
  color: #8c7853;
  margin-bottom: 8px;
}
.alt-med-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4a3728;
  padding: 4px 0;
}
.alt-rank { color: #8c7853; font-weight: 700; }
.alt-name { font-weight: 600; }
.alt-score { color: #b5a48a; font-size: 12px; }

/* ===== 分龄用量 ===== */
.dosage-card {
  margin: 16px 16px 0;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(139,119,86,0.10);
  padding: 20px;
  border: 1px solid #e8dfd5;
}
.dosage-age {
  font-size: 15px;
  font-weight: 700;
  color: #4a3728;
  margin-bottom: 6px;
}
.dosage-note {
  font-size: 13px;
  color: #7a6b54;
  line-height: 1.6;
  margin-bottom: 8px;
}
.dosage-warn {
  font-size: 12px;
  color: #d46b08;
  background: #fff7e6;
  border-radius: 8px;
  padding: 8px 10px;
  line-height: 1.6;
}

/* ===== 家中药库 ===== */
.home-meds-card {
  margin: 16px 16px 0;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(139,119,86,0.10);
  padding: 20px;
  border: 1px solid #e8dfd5;
}
.home-meds-note {
  font-size: 13px;
  color: #7a6b54;
  line-height: 1.6;
}
.home-meds-note a {
  color: #8c7853;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1px dashed #c4a265;
}

/* ===== 安全提示 ===== */
.safety-card {
  margin: 16px 16px 0;
  background: #fffdf8;
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(139,119,86,0.08);
  padding: 20px;
  border: 1px solid #e8dfd5;
}
.safety-item {
  font-size: 12px;
  color: #8c7853;
  line-height: 1.7;
  padding: 2px 0;
}

/* ===== 底部操作 ===== */
.result-actions {
  position: fixed;
  bottom: 0; left: 0; right: 0;
  display: flex;
  gap: 10px;
  padding: 12px 16px;
  background: linear-gradient(0deg, #f8f4ee 85%, transparent 100%);
  border-top: 1px solid #e8dfd5;
  z-index: 100;
}
.act-btn {
  flex: 1;
  padding: 12px 0;
  border: none;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  letter-spacing: 1px;
  white-space: nowrap;
}
.act-back {
  background: #fffdf8;
  color: #8c7853;
  border: 1.5px solid #e8dfd5;
}
.act-back:hover { border-color: #c4a265; background: #f8f4ee; }
.act-medicine {
  background: #fffdf8;
  color: #389e0d;
  border: 1.5px solid #b7eb8f;
}
.act-medicine:hover { border-color: #52c41a; background: #f6ffed; }
.act-knowledge {
  background: #fffdf8;
  color: #8c7853;
  border: 1.5px solid #e8dfd5;
}
.act-knowledge:hover { border-color: #c4a265; background: #f8f4ee; }
.act-home {
  background: linear-gradient(135deg, #8c7853, #a88c5e);
  color: #fff;
  box-shadow: 0 4px 12px rgba(139,119,86,0.20);
}
.act-home:hover { transform: scale(1.02); }
</style>
