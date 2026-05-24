<template>
  <div class="detail-page">
    <div class="page-header">
      <van-icon name="arrow-left" class="back-btn" size="22" @click="router.back()" />
      <h2>💊 {{ medicine?.name || '药品详情' }}</h2>
      <p>儿童专属用药指导</p>
    </div>

    <div v-if="!medicine" class="empty-tip">未找到该药品信息</div>

    <div v-else class="detail-body">
      <!-- 基本信息 -->
      <div class="section">
        <h3>📋 基本信息</h3>
        <div class="info-row"><span class="label">药品名</span><span>{{ medicine.name }}</span></div>
        <div v-if="medicine.manufacturer" class="info-row"><span class="label">生产厂家</span><span>{{ medicine.manufacturer }}</span></div>
        <div v-if="medicine.spec" class="info-row"><span class="label">药品规格</span><span>{{ medicine.spec }}</span></div>
        <div class="info-row"><span class="label">功效</span><span>{{ medicine.efficacy }}</span></div>
        <div v-if="medicine.source === 'custom'" class="info-row">
          <span class="label">来源</span><span>自定义录入</span>
        </div>
      </div>

      <!-- 分龄用量（高亮当前年龄） -->
      <div class="section">
        <h3>📏 分龄用量</h3>
        <div class="dose-card" :class="{ highlight: true }">
          <div class="dose-title">👶 0-3岁（婴幼儿）</div>
          <div class="dose-content">{{ medicine.dose_0_3 || '暂无数据' }}</div>
        </div>
        <div class="dose-card">
          <div class="dose-title">🧒 3-6岁（学龄前）</div>
          <div class="dose-content">{{ medicine.dose_3_6 || '暂无数据' }}</div>
        </div>
        <div class="dose-card">
          <div class="dose-title">👦 6-12岁（学龄）</div>
          <div class="dose-content">{{ medicine.dose_6_12 || '暂无数据' }}</div>
        </div>
      </div>

      <!-- 初期护理方案 -->
      <div v-if="medicine.early_nurse" class="section nurse-section">
        <h3>🏠 初期居家护理方案</h3>
        <div class="nurse-text">{{ medicine.early_nurse }}</div>
      </div>

      <!-- 忌口 -->
      <div v-if="medicine.food_forbid" class="section forbid-section">
        <h3>🚫 服药期间忌口</h3>
        <div class="forbid-text">{{ medicine.food_forbid }}</div>
      </div>

      <!-- 儿童禁忌 -->
      <div v-if="medicine.baby_taboo" class="section taboo-section">
        <h3>⚠️ 儿童用药禁忌</h3>
        <div class="taboo-text">{{ medicine.baby_taboo }}</div>
      </div>

      <!-- 就医提示 -->
      <div v-if="medicine.seek_medical" class="section seek-section">
        <h3>🏥 何时必须就医</h3>
        <div class="seek-text">{{ medicine.seek_medical }}</div>
      </div>

      <!-- 库存管理（所有药品均可编辑） -->
      <div class="section">
        <h3>📦 家庭库存管理</h3>
        <van-field v-model="editStock" label="保有数量" type="digit" placeholder="请输入家庭保有数量" />
        <div class="unit-row">
          <span class="unit-label">单位</span>
          <van-radio-group v-model="editUnit" direction="horizontal" class="unit-group">
            <van-radio name="袋/瓶">袋/瓶</van-radio>
            <van-radio name="盒">盒</van-radio>
          </van-radio-group>
        </div>
        <van-field v-model="editShelf" label="保质期至" placeholder="如：2027-12-31" />
        <van-field v-model="editStorage" label="存放位置" placeholder="如：客厅药箱上层" />
        <van-button type="primary" block round size="small" @click="saveEdit" style="margin-top:12px;">保存修改</van-button>
      </div>

      <!-- 删除（仅自定义药品） -->
      <div v-if="medicine.source === 'custom'" class="section" style="text-align:center;">
        <van-button type="danger" plain block round size="small" @click="handleDelete">删除此药品</van-button>
      </div>
    </div>

    <div style="height:20px;"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMedicineStore } from '../store/useMedicineStore'
import { showConfirmDialog } from 'vant'

const route = useRoute()
const router = useRouter()
const medicineStore = useMedicineStore()

const medicine = computed(() => medicineStore.getById(route.params.id))
const editStock = ref('')
const editUnit = ref('袋/瓶')
const editShelf = ref('')
const editStorage = ref('')

onMounted(() => {
  if (medicine.value) {
    editStock.value = String(medicine.value.stock || 0)
    editUnit.value = medicine.value.unit || '袋/瓶'
    editShelf.value = medicine.value.shelf_life || ''
    editStorage.value = medicine.value.storage || ''
  }
})

function saveEdit() {
  medicineStore.updateMedicine(route.params.id, {
    stock: parseInt(editStock.value) || 0,
    unit: editUnit.value,
    shelf_life: editShelf.value,
    storage: editStorage.value
  })
  showConfirmDialog({ title: '保存成功', message: '库存信息已更新' })
}

function handleDelete() {
  showConfirmDialog({
    title: '确认删除',
    message: '确定要删除此药品吗？删除后不可恢复。',
  }).then(() => {
    medicineStore.deleteMedicine(route.params.id)
    router.back()
  }).catch(() => {})
}
</script>

<style scoped>
.detail-page { background: #f5f5f5; min-height: 100vh; }
.page-header {
  background: linear-gradient(135deg, #4fc08d 0%, #3aa876 100%);
  color: #fff; padding: 20px 16px 16px; border-radius: 0 0 16px 16px;
}
.back-btn { cursor: pointer; margin-right: 8px; vertical-align: middle; }
.page-header h2 { font-size: 18px; margin: 0 0 4px; }
.page-header p { font-size: 12px; opacity: 0.85; margin: 0; }

.detail-body { padding: 0 12px; }
.section {
  background: #fff; border-radius: 12px; padding: 16px; margin-top: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.section h3 { font-size: 14px; margin: 0 0 12px; color: #333; }

.info-row { display: flex; gap: 8px; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 13px; }
.info-row:last-child { border-bottom: none; }
.info-row .label { color: #888; min-width: 60px; flex-shrink: 0; }

.dose-card {
  background: #f8f8f8; border-radius: 8px; padding: 10px 12px; margin-bottom: 8px;
  border: 1px solid #eee;
}
.dose-card.highlight {
  background: #e6f7ff; border-color: #91d5ff;
}
.dose-title { font-size: 12px; color: #1890ff; font-weight: 500; margin-bottom: 4px; }
.dose-content { font-size: 13px; color: #333; line-height: 1.6; }

.nurse-section { background: #f6ffed; border: 1px solid #b7eb8f; }
.forbid-section { background: #fff7e6; border: 1px solid #ffe58f; }
.taboo-section { background: #fff2f0; border: 1px solid #ffccc7; }
.seek-section { background: #e6f7ff; border: 1px solid #91d5ff; }

.nurse-text, .forbid-text, .taboo-text, .seek-text {
  font-size: 13px; color: #333; line-height: 1.8;
}

.empty-tip { text-align: center; color: #999; padding: 40px 0; font-size: 13px; }

.unit-row {
  display: flex; align-items: center; padding: 10px 16px;
  border-bottom: 1px solid #ebedf0;
}
.unit-label { font-size: 14px; color: #646566; width: 90px; flex-shrink: 0; }
.unit-group { flex: 1; }
.unit-group :deep(.van-radio) { margin-right: 24px; }
</style>
