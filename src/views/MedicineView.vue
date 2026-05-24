<template>
  <div class="medicine-page">
    <div class="page-header">
      <div class="header-top">
        <button class="back-btn" @click="goBack">← 返回</button>
      </div>
      <h2>💊 药品中心</h2>
      <p>常用药参考 · 家庭药库管理</p>
    </div>

    <!-- Tab 切换 -->
    <van-tabs v-model:active="activeTab" color="#4fc08d" title-active-color="#4fc08d" sticky>
      <!-- ==================== Tab1: 常用药参考 ==================== -->
      <van-tab title="📖 常用药参考">
        <van-search v-model="refSearch" placeholder="搜索药品名称或症状..." shape="round" />

        <div class="med-list">
          <div v-if="filteredRef.length === 0" class="empty-tip">未找到匹配的药品</div>

          <div v-for="med in filteredRef" :key="'ref-'+med.id" class="ref-card">
            <!-- 折叠头部 -->
            <div class="ref-header" @click="toggleExpand(med.id)">
              <div class="ref-header-left">
                <div class="ref-name">
                  {{ med.name }}
                  <van-tag :type="med.type === 'western' ? 'warning' : med.type === 'external' ? 'default' : 'success'" plain size="small">
                    {{ med.type === 'western' ? '西药' : med.type === 'external' ? '外用' : '中成药' }}
                  </van-tag>
                </div>
                <div class="ref-fit">适用：{{ med.fit_symptom ? med.fit_symptom.split(',')[0] + (med.fit_symptom.split(',').length > 1 ? '...' : '') : '暂无' }}</div>
              </div>
              <van-icon :name="expandedId === med.id ? 'arrow-up' : 'arrow-down'" color="#999" />
            </div>

            <!-- 展开详情 -->
            <div v-if="expandedId === med.id" class="ref-detail">
              <div class="ref-section">
                <div class="ref-section-title">功效说明</div>
                <div class="ref-section-text">{{ med.efficacy }}</div>
              </div>

              <div class="ref-section">
                <div class="ref-section-title">🏥 分龄用量</div>
                <div class="dose-row" v-if="med.dose_0_3">
                  <span class="dose-age">0-3岁</span>
                  <span class="dose-val">{{ med.dose_0_3 }}</span>
                </div>
                <div class="dose-row" v-if="med.dose_3_6">
                  <span class="dose-age">3-6岁</span>
                  <span class="dose-val">{{ med.dose_3_6 }}</span>
                </div>
                <div class="dose-row" v-if="med.dose_6_12">
                  <span class="dose-age">6-12岁</span>
                  <span class="dose-val">{{ med.dose_6_12 }}</span>
                </div>
                <div class="dose-row dose-note" v-if="med.form_note">
                  <span class="dose-age">💡 提示</span>
                  <span class="dose-val">{{ med.form_note }}</span>
                </div>
              </div>

              <div class="ref-section" v-if="med.combo_with">
                <div class="ref-section-title">🔗 可搭配药品</div>
                <div class="ref-section-text">{{ med.combo_with }}</div>
              </div>

              <div class="ref-section ref-warn" v-if="med.baby_taboo">
                <div class="ref-section-title">⚠️ 禁忌</div>
                <div class="ref-section-text">{{ med.baby_taboo }}</div>
              </div>

              <div class="ref-section" v-if="med.diet_note">
                <div class="ref-section-title">🍵 护理建议</div>
                <div class="ref-section-text">{{ med.diet_note }}</div>
              </div>

              <div class="ref-section" v-if="med.food_forbid">
                <div class="ref-section-title">🚫 忌口</div>
                <div class="ref-section-text">{{ med.food_forbid }}</div>
              </div>

              <div class="ref-section ref-danger" v-if="med.seek_medical">
                <div class="ref-section-title">🚨 需立即就医</div>
                <div class="ref-section-text">{{ med.seek_medical }}</div>
              </div>

              <div class="ref-section" v-if="med.storage">
                <div class="ref-section-title">📦 存放方法</div>
                <div class="ref-section-text">{{ med.storage }}</div>
              </div>

              <!-- 加入家庭药库 -->
              <div class="ref-action">
                <button class="add-cabinet-btn" @click.stop="addToCabinet(med)">
                  ➕ 加入家庭药库
                </button>
              </div>
            </div>
          </div>
        </div>

        <div style="height:20px;"></div>
      </van-tab>

      <!-- ==================== Tab2: 家庭药库 ==================== -->
      <van-tab title="🏠 家庭药库">
        <!-- 操作栏 -->
        <div class="toolbar">
          <van-search v-model="cabSearch" placeholder="搜索家庭药品..." shape="round" style="flex:1;" />
          <van-button type="primary" size="small" @click="showAddSheet = true" style="margin-left:8px;">+ 录入</van-button>
        </div>

        <!-- 临期/低库存提醒 -->
        <div v-if="cabExpiring.length > 0" class="expire-warning">
          ⚠️ {{ cabExpiring.length }} 种药品 {{ expireDays }}天内过期，请及时检查！
        </div>
        <div v-if="cabLowStock.length > 0" class="lowstock-warning">
          📦 {{ cabLowStock.length }} 种药品库存不足（≤1件）：
          <span v-for="m in cabLowStock" :key="'ls-'+m.id" class="lowstock-med">{{ m.name }}</span>
        </div>

        <!-- 药库列表（仅显示有库存的） -->
        <div class="med-list">
          <div v-if="filteredCab.length === 0" class="empty-tip">
            家庭药库为空<br>点击"+ 录入"添加药品，或从"常用药参考"中一键加入
          </div>

          <van-swipe-cell v-for="med in filteredCab" :key="'cab-'+med.id">
            <div class="med-item" @click="goDetail(med)">
              <div class="med-info">
                <div class="med-name">
                  {{ med.name }}
                  <van-tag v-if="med.source === 'custom'" type="primary" plain size="small">自定义</van-tag>
                  <van-tag v-if="med.source === 'preset'" type="success" plain size="small">参考</van-tag>
                </div>
                <div class="med-sub" v-if="med.manufacturer || med.spec">
                  <span v-if="med.manufacturer" class="mfr-tag">🏭 {{ med.manufacturer }}</span>
                  <span v-if="med.spec" class="spec-tag">📏 {{ med.spec }}</span>
                </div>
                <div class="med-fit">适配：{{ med.fit_symptom ? med.fit_symptom.split(',')[0] : '暂无' }}</div>
                <div class="med-meta">
                  <span v-if="med.shelf_life && isExpiring(med)" class="expire-tag">临期</span>
                  <span class="stock-tag">库存：{{ med.stock || 0 }}{{ med.unit || '袋/瓶' }}</span>
                  <span class="storage-tag" v-if="med.storage">存放：{{ med.storage }}</span>
                </div>
              </div>
              <div class="med-actions">
                <van-icon name="delete-o" color="#ee0a24" class="delete-icon" @click.stop="handleDeleteCabinet(med)" />
                <van-icon name="arrow" color="#ccc" />
              </div>
            </div>
            <template #right>
              <van-button square type="danger" text="删除" class="swipe-delete-btn" @click="handleDeleteCabinet(med)" />
            </template>
          </van-swipe-cell>
        </div>

        <div style="height:20px;"></div>
      </van-tab>
    </van-tabs>

    <!-- 录入方式 ActionSheet -->
    <van-action-sheet
      v-model:show="showAddSheet"
      :actions="addActions"
      cancel-text="取消"
      @select="onAddSelect"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicineStore } from '../store/useMedicineStore'
import { useTrialStore } from '../store/useTrialStore'
import { showToast, showConfirmDialog } from 'vant'

const router = useRouter()
const medicineStore = useMedicineStore()
const trialStore = useTrialStore()

// ===== Tab 状态 =====
const activeTab = ref(0)
const refSearch = ref('')
const cabSearch = ref('')
const expandedId = ref(null)
const showAddSheet = ref(false)
const expireDays = 30

// ===== 录入方式 =====
const addActions = [
  { name: 'manual', subname: '手动填写药品信息', icon: 'edit' },
  { name: 'camera', subname: '手机拍照自动识别', icon: 'photograph' },
]

function onAddSelect(action) {
  showAddSheet.value = false
  if (!trialStore.canEdit()) {
    router.push('/trial-expired')
    return
  }
  if (action.name === 'camera') {
    router.push('/ocr-add')
  } else {
    router.push('/add-medicine')
  }
}

// ===== 常用药参考 =====
const filteredRef = computed(() => {
  const kw = refSearch.value.trim().toLowerCase()
  const list = medicineStore.referenceMedicines
  if (!kw) return list
  return list.filter(m =>
    m.name.toLowerCase().includes(kw) ||
    (m.fit_symptom && m.fit_symptom.toLowerCase().includes(kw))
  )
})

function toggleExpand(id) {
  expandedId.value = expandedId.value === id ? null : id
}

function cabinetStock(id) {
  const med = medicineStore.medicineList.find(m => String(m.id) === String(id))
  return med ? med.stock : 0
}

function cabinetUnit(id) {
  const med = medicineStore.medicineList.find(m => String(m.id) === String(id))
  return med ? med.unit : '袋/瓶'
}

function addToCabinet(med) {
  if (!trialStore.canEdit()) {
    router.push('/trial-expired')
    return
  }
  const currentStock = cabinetStock(med.id) || 0
  medicineStore.addToCabinet(med.id, currentStock + 1, med.unit || '袋/瓶')
  showToast(currentStock > 0 ? '库存已 +1' : '已加入家庭药库')
}

// ===== 家庭药库 =====
const filteredCab = computed(() => {
  const kw = cabSearch.value.trim().toLowerCase()
  const list = medicineStore.cabinetMedicines
  if (!kw) return list
  return list.filter(m =>
    m.name.toLowerCase().includes(kw) ||
    (m.fit_symptom && m.fit_symptom.toLowerCase().includes(kw))
  )
})

const cabExpiring = computed(() =>
  medicineStore.cabinetMedicines.filter(m => {
    if (!m.shelf_life) return false
    const exp = new Date(m.shelf_life)
    if (isNaN(exp.getTime())) return false
    const diff = (exp - Date.now()) / 86400000
    return diff >= 0 && diff <= expireDays
  })
)

const cabLowStock = computed(() =>
  medicineStore.cabinetMedicines.filter(m => (m.stock || 0) <= 1)
)

function isExpiring(med) {
  if (!med.shelf_life) return false
  const exp = new Date(med.shelf_life)
  if (isNaN(exp.getTime())) return false
  const diff = (exp - Date.now()) / 86400000
  return diff >= 0 && diff <= expireDays
}

// ===== 导航 =====
function goBack() { router.back() }
function goAdd() {
  if (!trialStore.canEdit()) {
    router.push('/trial-expired')
    return
  }
  router.push('/add-medicine')
}
function goDetail(med) { router.push('/medicine-detail/' + med.id) }

function handleDeleteCabinet(med) {
  const isCustom = med.source === 'custom'
  const tipText = isCustom
    ? `确定要删除「${med.name}」吗？删除后不可恢复。`
    : `确定要从家庭药库移除「${med.name}」吗？\n移除后可从常用药参考中重新加入。`
  showConfirmDialog({
    title: isCustom ? '确认删除' : '确认移除',
    message: tipText,
    confirmButtonText: isCustom ? '删除' : '移除',
    confirmButtonColor: '#ee0a24',
  }).then(() => {
    medicineStore.removeFromCabinet(med.id)
    showToast(isCustom ? '已删除' : '已移除')
  }).catch(() => {})
}
</script>

<style scoped>
.medicine-page { background: #f5f5f5; min-height: 100vh; }
.page-header {
  background: linear-gradient(135deg, #4fc08d 0%, #3aa876 100%);
  color: #fff; padding: 12px 16px 16px; border-radius: 0 0 16px 16px;
}
.header-top { margin-bottom: 4px; }
.back-btn {
  background: rgba(255,255,255,0.2);
  border: 1px solid rgba(255,255,255,0.35);
  color: #fff; padding: 4px 12px; border-radius: 14px;
  font-size: 12px; font-weight: 600; cursor: pointer;
  transition: all 0.2s ease;
}
.back-btn:hover { background: rgba(255,255,255,0.35); }
.back-btn:active { transform: scale(0.95); }
.page-header h2 { font-size: 18px; margin: 0 0 4px; }
.page-header p { font-size: 12px; opacity: 0.85; margin: 0; }

/* ===== Tab 样式调整 ===== */
:deep(.van-tabs__nav) { background: #fff; }
:deep(.van-tab--active) { font-weight: 600; }

/* ===== 工具栏 ===== */
.toolbar {
  display: flex; align-items: center; padding: 12px 12px 0;
}

/* ===== 警告条 ===== */
.expire-warning {
  background: #fff2f0; color: #cf1322; font-size: 12px;
  padding: 8px 16px; margin: 12px 12px 0; border-radius: 8px;
  border: 1px solid #ffccc7; cursor: pointer;
}
.lowstock-warning {
  background: #e6f7ff; color: #0050b3; font-size: 12px;
  padding: 8px 16px; margin: 8px 12px 0; border-radius: 8px;
  border: 1px solid #91d5ff; line-height: 1.8;
}
.lowstock-med {
  background: #0050b3; color: #fff; font-size: 10px;
  padding: 1px 6px; border-radius: 8px; margin-left: 4px;
  display: inline-block; margin-top: 2px;
}

/* ===== 常用药参考卡片 ===== */
.med-list { padding: 0 12px; }
.ref-card {
  background: #fff; border-radius: 12px; margin-bottom: 8px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden;
}
.ref-header {
  padding: 14px 16px; display: flex; align-items: center;
  justify-content: space-between; cursor: pointer;
  transition: background 0.15s;
}
.ref-header:hover { background: #f9f9f9; }
.ref-header:active { background: #f0f0f0; }
.ref-header-left { flex: 1; min-width: 0; }
.ref-name {
  font-size: 15px; font-weight: 600; color: #333;
  display: flex; align-items: center; gap: 6px;
}
.ref-fit {
  font-size: 12px; color: #888; margin-top: 4px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}

/* 展开详情 */
.ref-detail {
  border-top: 1px solid #f0f0f0; padding: 0 16px 16px;
}
.ref-section { margin-top: 14px; }
.ref-section-title {
  font-size: 13px; font-weight: 700; color: #4a3728; margin-bottom: 6px;
}
.ref-section-text {
  font-size: 13px; color: #555; line-height: 1.7;
}
.ref-warn { background: #fff7e6; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #fa8c16; }
.ref-warn .ref-section-text { color: #8c5e00; }
.ref-danger { background: #fff1f0; padding: 10px 12px; border-radius: 8px; border-left: 3px solid #ff4d4f; }
.ref-danger .ref-section-text { color: #a8071a; }

/* 分龄用量 */
.dose-row {
  display: flex; align-items: baseline; gap: 8px;
  padding: 3px 0; font-size: 13px;
}
.dose-age {
  color: #4fc08d; font-weight: 700; min-width: 52px; font-size: 12px;
}
.dose-val { color: #555; flex: 1; }
.dose-note { margin-top: 4px; }
.dose-note .dose-age { color: #fa8c16; }
.dose-note .dose-val { color: #888; font-size: 12px; }

/* 加入药库操作 */
.ref-action {
  display: flex; align-items: center; justify-content: flex-end;
  margin-top: 16px; padding-top: 12px; border-top: 1px dashed #e8e8e8;
}
.add-cabinet-btn {
  padding: 8px 18px; border-radius: 20px; border: none;
  background: linear-gradient(135deg, #4fc08d, #3aa876);
  color: #fff; font-size: 13px; font-weight: 600; cursor: pointer;
  transition: all 0.2s;
}
.add-cabinet-btn:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(79,192,141,0.35); }
.add-cabinet-btn:active { transform: scale(0.96); }

/* ===== 家庭药库列表 ===== */
.med-item {
  background: #fff; border-radius: 12px; padding: 14px 16px;
  margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); cursor: pointer;
  transition: transform 0.15s;
}
.med-item:active { transform: scale(0.98); }
.med-info { flex: 1; min-width: 0; }
.med-actions {
  display: flex; flex-direction: column; align-items: center; gap: 6px;
  margin-left: 8px; flex-shrink: 0;
}
.delete-icon {
  font-size: 16px; padding: 4px; cursor: pointer;
  transition: transform 0.15s;
}
.delete-icon:hover { transform: scale(1.2); }
.delete-icon:active { transform: scale(0.9); }
.med-name {
  font-size: 14px; font-weight: 500; color: #333;
  display: flex; align-items: center; gap: 6px;
}
.med-fit { font-size: 12px; color: #888; margin-top: 4px; }
.med-sub { display: flex; gap: 8px; margin-top: 4px; flex-wrap: wrap; }
.mfr-tag {
  font-size: 11px; color: #8c5e00; background: #fffbe6;
  padding: 1px 6px; border-radius: 4px; border: 1px solid #ffe58f;
}
.spec-tag {
  font-size: 11px; color: #006d75; background: #e6fffb;
  padding: 1px 6px; border-radius: 4px; border: 1px solid #87e8de;
}
.med-meta { display: flex; gap: 8px; margin-top: 6px; flex-wrap: wrap; }
.expire-tag {
  background: #fff2f0; color: #cf1322; font-size: 11px;
  padding: 1px 6px; border-radius: 4px;
}
.stock-tag {
  background: #f0f0f0; color: #666; font-size: 11px;
  padding: 1px 6px; border-radius: 4px;
}
.storage-tag {
  background: #e6f7ff; color: #0070c9; font-size: 11px;
  padding: 1px 6px; border-radius: 4px;
}

/* ===== 空状态 ===== */
.empty-tip {
  text-align: center; color: #999; font-size: 13px;
  padding: 40px 0; line-height: 1.8;
}

/* ===== 滑动删除 ===== */
.swipe-delete-btn {
  height: 100% !important;
  font-size: 14px;
  border-radius: 0 12px 12px 0;
}
</style>
