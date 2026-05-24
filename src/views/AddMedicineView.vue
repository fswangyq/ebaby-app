<template>
  <div class="add-page">
    <div class="page-header">
      <van-icon name="arrow-left" class="back-btn" size="22" @click="router.back()" />
      <h2>➕ 录入药品</h2>
      <p>手动添加家庭常备儿童中成药</p>
    </div>

    <div class="form-area">
      <van-form @submit="handleSubmit">
        <van-field v-model="form.name" label="药品名称" placeholder="必填，如：小儿豉翘清热颗粒" required>
          <template #button>
            <van-button size="small" type="primary" plain :disabled="!form.name.trim()" @click="autoFill">
              ✨ 智能填充
            </van-button>
          </template>
        </van-field>
        <van-field v-model="form.manufacturer" label="生产厂家" placeholder="如：济川药业（同药不同厂家将分列）" />
        <van-field v-model="form.spec" label="药品规格" placeholder="如：6g×6袋/盒（同药不同规格将分列）" />
        <van-field v-model="form.fit_symptom" label="适配症状" placeholder="如：感冒、发热、咳嗽（逗号分隔）" />
        <van-field v-model="form.efficacy" label="功效说明" placeholder="药品功效描述" type="textarea" rows="2" />
        <van-field v-model="form.dose_0_3" label="0-3岁用量" placeholder="如：1/3袋/次，一日3次" />
        <van-field v-model="form.dose_3_6" label="3-6岁用量" placeholder="如：1/2袋/次，一日3次" />
        <van-field v-model="form.dose_6_12" label="6-12岁用量" placeholder="如：1袋/次，一日3次" />
        <van-field v-model="form.early_nurse" label="护理方案" placeholder="初期居家护理建议" type="textarea" rows="2" />
        <van-field v-model="form.baby_taboo" label="儿童禁忌" placeholder="慎用、禁用情况" type="textarea" rows="2" />
        <van-field v-model="form.food_forbid" label="服药忌口" placeholder="如：忌油腻、甜食" />
        <van-field v-model="form.seek_medical" label="何时就医" placeholder="重症判定标准" type="textarea" rows="2" />
        <van-field v-model="form.shelf_life" label="保质期至" placeholder="如：2027-12-31" />
        <van-field v-model="form.storage" label="存放位置" placeholder="如：客厅药箱上层" />
        <van-field v-model="form.stock" label="库存数量" type="digit" placeholder="请输入数量" />
        <div class="unit-row">
          <span class="unit-label">单位</span>
          <van-radio-group v-model="form.unit" direction="horizontal" class="unit-group">
            <van-radio name="袋/瓶">袋/瓶</van-radio>
            <van-radio name="盒">盒</van-radio>
          </van-radio-group>
        </div>

        <div style="padding:16px;">
          <van-button type="primary" block round native-type="submit" size="large">确认录入</van-button>
          <van-button plain block round size="small" style="margin-top:8px;" @click="$router.back()">取消</van-button>
        </div>
      </van-form>
    </div>

    <div style="height:20px;"></div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useMedicineStore } from '../store/useMedicineStore'
import { medicineData } from '../data/medicineData'
import { showToast } from 'vant'

const router = useRouter()
const medicineStore = useMedicineStore()

const form = reactive({
  name: '',
  manufacturer: '',
  spec: '',
  fit_symptom: '',
  efficacy: '',
  dose_0_3: '',
  dose_3_6: '',
  dose_6_12: '',
  early_nurse: '',
  baby_taboo: '',
  food_forbid: '',
  seek_medical: '',
  shelf_life: '',
  storage: '',
  stock: '1',
  unit: '袋/瓶'
})

function autoFill() {
  const name = form.name.trim()
  if (!name) return

  // 模糊匹配内置药库
  const match = medicineData.find(m => m.name.includes(name) || name.includes(m.name))

  if (match) {
    form.fit_symptom = match.fit_symptom || ''
    form.efficacy = match.efficacy || ''
    form.dose_0_3 = match.dose_0_3 || ''
    form.dose_3_6 = match.dose_3_6 || ''
    form.dose_6_12 = match.dose_6_12 || ''
    form.early_nurse = match.early_nurse || ''
    form.baby_taboo = match.baby_taboo || ''
    form.food_forbid = match.food_forbid || ''
    form.seek_medical = match.seek_medical || ''
    showToast(`已从内置药库匹配「${match.name}」，请核对修改`)
  } else {
    // 未匹配时，根据适应症生成基础模板
    const symptom = form.fit_symptom || form.name
    form.efficacy = form.efficacy || `用于${symptom}的辅助调理（自定义录入，请核实用法）`
    form.early_nurse = form.early_nurse || `观察症状变化，注意休息饮水。如症状加重请及时就医。`
    form.baby_taboo = form.baby_taboo || '请遵医嘱使用，确认儿童适用。'
    form.seek_medical = form.seek_medical || '症状持续不缓解、出现高热、精神萎靡时立即就医。'
    showToast('未匹配到内置药库，已生成基础模板，请手动完善')
  }
}

function handleSubmit() {
  if (!form.name.trim()) {
    showToast('请填写药品名称')
    return
  }
  const beforeCount = medicineStore.cabinetMedicines.length
  medicineStore.addMedicine({ ...form })
  const afterCount = medicineStore.cabinetMedicines.length
  if (afterCount <= beforeCount) {
    showToast('已合并到同药同厂家同规格的库存中 ✓')
  } else {
    showToast('录入成功！')
  }
  router.push('/medicine')
}
</script>

<style scoped>
.add-page { background: #f5f5f5; min-height: 100vh; }
.page-header {
  background: linear-gradient(135deg, #4fc08d 0%, #3aa876 100%);
  color: #fff; padding: 20px 16px 16px; border-radius: 0 0 16px 16px;
}
.back-btn { cursor: pointer; margin-right: 8px; vertical-align: middle; }
.page-header h2 { font-size: 18px; margin: 0 0 4px; }
.page-header p { font-size: 12px; opacity: 0.85; margin: 0; }

.form-area {
  margin: 12px; background: #fff; border-radius: 12px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05); overflow: hidden;
}

.unit-row {
  display: flex; align-items: center; padding: 10px 16px;
  border-bottom: 1px solid #ebedf0;
}
.unit-label { font-size: 14px; color: #646566; width: 90px; flex-shrink: 0; }
.unit-group { flex: 1; }
.unit-group :deep(.van-radio) { margin-right: 24px; }
</style>
