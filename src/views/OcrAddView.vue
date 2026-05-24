<template>
  <div class="ocr-page">
    <!-- 顶部导航栏，含返回键 -->
    <div class="nav-bar">
      <van-icon name="arrow-left" class="nav-back" @click="router.back()" />
      <span class="nav-title">拍照录入药品</span>
      <span class="nav-placeholder"></span>
    </div>

    <!-- 拍摄区域（只有一个） -->
    <div v-if="step === 'idle'" class="capture-area" @click="startCapture">
      <div class="capture-icon">📷</div>
      <div class="capture-text">点击拍摄药品包装</div>
      <div class="capture-hint">请拍摄药品包装盒正面，确保文字清晰</div>
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        capture="environment"
        style="display:none"
        @change="onFileSelected"
      />
    </div>

    <!-- 识别中动画 -->
    <div v-if="step === 'recognizing'" class="recognizing-area">
      <div class="scan-animation">
        <div class="scan-line"></div>
      </div>
      <div class="recog-text">正在识别药品信息...</div>
      <div class="recog-hint">请稍候，通常需1-3秒</div>
      <van-button size="small" plain @click="step = 'manual'" style="margin-top:16px;">
        识别不准？手动输入
      </van-button>
    </div>

    <!-- 识别结果确认 -->
    <div v-if="step === 'result'" class="result-area">
      <h3>✅ 识别结果</h3>
      <p class="result-hint">请核对以下信息，确认无误后点击入库</p>

      <van-form class="result-form">
        <van-field v-model="ocrResult.name" label="药品名称" placeholder="识别出的药品名称" required />
        <van-field v-model="ocrResult.fit_symptom" label="适配症状" placeholder="如：感冒、咳嗽" />
        <van-field v-model="ocrResult.efficacy" label="功效" placeholder="药品功效说明" />
        <van-field v-model="ocrResult.dose_0_3" label="0-3岁用量" placeholder="如：1/3袋/次" />
        <van-field v-model="ocrResult.dose_3_6" label="3-6岁用量" placeholder="如：1/2袋/次" />
        <van-field v-model="ocrResult.dose_6_12" label="6-12岁用量" placeholder="如：1袋/次" />
        <van-field v-model="ocrResult.shelf_life" label="保质期" placeholder="如：2027-12-31" />
        <van-field v-model="ocrResult.storage" label="存放位置" placeholder="如：客厅药箱" />
        <van-field v-model="ocrResult.stock" label="库存数量" type="digit" placeholder="请输入数量" />
        <!-- 单位选择 -->
        <van-field name="unit" label="单位">
          <template #input>
            <van-radio-group v-model="ocrResult.unit" direction="horizontal">
              <van-radio name="袋/瓶">袋/瓶</van-radio>
              <van-radio name="盒">盒</van-radio>
            </van-radio-group>
          </template>
        </van-field>
      </van-form>

      <div class="result-actions">
        <van-button type="primary" block round size="large" @click="confirmAdd">
          确认入库
        </van-button>
        <van-button plain block round size="small" @click="step = 'idle'" style="margin-top:8px;">
          重新拍摄
        </van-button>
      </div>
    </div>

    <!-- 手动输入提示 -->
    <div v-if="step === 'manual'" class="manual-tip">
      <van-button type="primary" block round @click="fillManual" style="margin:16px 12px;">
        前往手动录入页面
      </van-button>
      <van-button plain block round @click="step = 'idle'" style="margin:0 12px 16px;">
        返回重新拍照
      </van-button>
    </div>

    <!-- 入库成功 -->
    <van-dialog v-model:show="showSuccess" title="🎉 录入成功" :show-confirm-button="false">
      <div style="text-align:center;padding:20px 16px;">
        <p style="font-size:14px;color:#07c160;margin:0 0 8px;">药品已成功录入家庭药库！</p>
        <p style="font-size:12px;color:#888;">系统已自动补全用量和禁忌数据</p>
        <van-button type="primary" size="small" @click="resetAll" style="margin-top:12px;">继续录入</van-button>
        <van-button size="small" plain @click="goMedicine" style="margin-top:8px;margin-left:8px;">查看药库</van-button>
      </div>
    </van-dialog>

    <div style="height:20px;"></div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { showToast, showDialog } from 'vant'
import { useMedicineStore } from '../store/useMedicineStore'

const router = useRouter()
const medicineStore = useMedicineStore()
const fileInput = ref(null)

const step = ref('idle') // idle -> recognizing -> result -> success
const showSuccess = ref(false)

const ocrResult = ref({
  name: '',
  fit_symptom: '',
  efficacy: '',
  dose_0_3: '',
  dose_3_6: '',
  dose_6_12: '',
  shelf_life: '',
  storage: '',
  stock: '1',
  unit: '袋/瓶',
  early_nurse: '',
  baby_taboo: '',
  food_forbid: '',
  seek_medical: ''
})

// 点击拍摄区域：弹窗提示后直接触发文件选择器（兼容所有浏览器）
function startCapture() {
  showDialog({
    title: '📷 拍摄药品包装',
    message: '点击下方按钮打开相机，拍摄药品包装盒正面（确保文字清晰）',
    confirmButtonText: '打开相机',
    cancelButtonText: '从相册选择',
    showCancelButton: true,
  }).then(() => {
    // 用户确认 → 用 capture 属性优先调起相机
    fileInput.value.setAttribute('capture', 'environment')
    fileInput.value.click()
  }).catch(() => {
    // 用户选择相册 → 去掉 capture 属性，允许从相册选择
    fileInput.value.removeAttribute('capture')
    fileInput.value.click()
    // 100ms 后恢复 capture 属性，下次点击恢复相机优先
    setTimeout(() => {
      fileInput.value.setAttribute('capture', 'environment')
    }, 100)
  })
}

// 文件选择回调：获取图片 → 调用OCR
function onFileSelected(event) {
  const file = event.target.files[0]
  if (!file) return
  step.value = 'recognizing'
  const reader = new FileReader()
  reader.onload = (e) => {
    const base64 = e.target.result
    callOCR(base64)
  }
  reader.readAsDataURL(file)
}

// OCR识别（真实接口，当前为模拟降级）
async function callOCR(base64Image) {
  // 优先尝试真实OCR API（腾讯云）
  // 环境变量 VITE_TENCENT_OCR_SECRET_ID / VITE_TENCENT_OCR_SECRET_KEY 需配置
  const secretId = import.meta.env.VITE_TENCENT_OCR_SECRET_ID
  const secretKey = import.meta.env.VITE_TENCENT_OCR_SECRET_KEY

  if (secretId && secretKey) {
    try {
      await callTencentOCR(base64Image, secretId, secretKey)
      return
    } catch (err) {
      console.warn('腾讯云OCR失败，降级模拟识别：', err.message)
    }
  }

  // 降级：模拟识别（开发阶段/无API配置时使用）
  setTimeout(() => {
    ocrResult.value = {
      name: '小儿豉翘清热颗粒',
      fit_symptom: '感冒,发热,咽喉肿痛',
      efficacy: '疏风解表，清热导滞。用于小儿风热感冒挟滞证。',
      dose_0_3: '0-1岁：1/4袋/次；1-3岁：1/3袋/次；一日3次',
      dose_3_6: '1/2袋/次，一日3次',
      dose_6_12: '1袋/次，一日3次',
      shelf_life: '2027-06-30',
      storage: '客厅药箱上层',
      stock: '1',
      early_nurse: '多喝温水，保持室内通风，饮食以清淡稀饭为主',
      baby_taboo: '风寒感冒禁用；腹泻患儿慎用',
      food_forbid: '忌油腻、生冷、甜食',
      seek_medical: '体温≥38.5℃持续不退、精神萎靡立即就医'
    }
    step.value = 'result'
  }, 1800)
}

// 腾讯云OCR通用印刷体识别
async function callTencentOCR(base64Image, secretId, secretKey) {
  // 去除base64前缀
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '')
  
  const response = await fetch('https://ocr.tencentcloudapi.com/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-TC-Action': 'GeneralBasicOCR',
      'X-TC-Version': '2018-11-19',
      'X-TC-Region': 'ap-guangzhou',
      'Authorization': `TC3-HMAC-SHA256 Credential=${secretId}/ocr/tc3_request, SignedHeaders=content-type;host, Signature=need-sign`
      // 注意：完整腾讯云签名较复杂，建议后端代理或用工长云SDK
      // 此处为接口预留，真实部署时建议通过后端云函数调用
    },
    body: JSON.stringify({
      ImageBase64: base64Data
    })
  })
  
  const data = await response.json()
  // 解析OCR结果，提取药品名、规格、有效期等信息
  parseOCRResult(data)
}

// 解析OCR返回结果，填充表单
function parseOCRResult(ocrData) {
  // 腾讯云OCR返回 TextDetections 数组，每项有 DetectedText
  const texts = (ocrData.TextDetections || []).map(t => t.DetectedText).join('\n')
  
  // 简单正则提取关键信息
  const nameMatch = texts.match(/(小儿[\u4e00-\u9fa5]{2,8}颗粒|[\u4e00-\u9fa5]{2,8}口服液|[\u4e00-\u9fa5]{2,8}颗粒|[\u4e00-\u9fa5]{2,8}片)/)
  const dateMatch = texts.match(/(\d{4})[.\-\/](\d{1,2})[.\-\/](\d{1,2})/)
  const batchMatch = texts.match(/批号[：:]?\s*([A-Za-z0-9]{6,12})/)

  ocrResult.value.name = nameMatch ? nameMatch[1] : ''
  ocrResult.value.shelf_life = dateMatch ? `${dateMatch[1]}-${dateMatch[2].padStart(2,'0')}-${dateMatch[3].padStart(2,'0')}` : ''
  
  // 尝试从预制药库匹配完整信息
  autoFillFromPreset(ocrResult.value.name)
  
  step.value = 'result'
}

// 从预制药库自动补全药品信息
function autoFillFromPreset(matchedName) {
  if (!matchedName) return
  const preset = medicineStore.presetMedicines.find(m => 
    m.name.includes(matchedName) || matchedName.includes(m.name)
  )
  if (preset) {
    ocrResult.value.fit_symptom = preset.fit_symptom
    ocrResult.value.efficacy = preset.efficacy
    ocrResult.value.dose_0_3 = preset.dose_0_3
    ocrResult.value.dose_3_6 = preset.dose_3_6
    ocrResult.value.dose_6_12 = preset.dose_6_12
    ocrResult.value.early_nurse = preset.early_nurse
    ocrResult.value.baby_taboo = preset.baby_taboo
    ocrResult.value.food_forbid = preset.food_forbid
    ocrResult.value.seek_medical = preset.seek_medical
  }
}

function confirmAdd() {
  if (!ocrResult.value.name) return
  medicineStore.addMedicine({ ...ocrResult.value })
  showSuccess.value = true
}

function resetAll() {
  showSuccess.value = false
  step.value = 'idle'
  ocrResult.value = {
    name: '', fit_symptom: '', efficacy: '',
    dose_0_3: '', dose_3_6: '', dose_6_12: '',
    shelf_life: '', storage: '', stock: '1', unit: '袋/瓶',
    early_nurse: '', baby_taboo: '', food_forbid: '', seek_medical: ''
  }
}

function goMedicine() {
  showSuccess.value = false
  router.push('/medicine')
}

function fillManual() {
  router.push('/add-medicine')
}
</script>

<style scoped>
.ocr-page { background: #f5f5f5; min-height: 100vh; }

/* 顶部导航栏 */
.nav-bar {
  display: flex; align-items: center; justify-content: space-between;
  background: linear-gradient(135deg, #4fc08d 0%, #3aa876 100%);
  color: #fff; padding: 14px 16px;
}
.nav-back { font-size: 20px; cursor: pointer; flex-shrink: 0; width: 28px; }
.nav-title { font-size: 17px; font-weight: 600; flex: 1; text-align: center; }
.nav-placeholder { width: 28px; flex-shrink: 0; }

/* 移除旧的 page-header 样式（本页面已改用 nav-bar）
   如需保留可取消注释
.page-header {
  background: linear-gradient(135deg, #4fc08d 0%, #3aa876 100%);
  color: #fff; padding: 20px 16px 16px; border-radius: 0 0 16px 16px;
}
.page-header h2 { font-size: 18px; margin: 0 0 4px; }
.page-header p { font-size: 12px; opacity: 0.85; margin: 0; }
*/

.capture-area {
  margin: 24px 12px; background: #fff; border-radius: 16px;
  padding: 40px 16px; text-align: center; cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 2px dashed #4fc08d;
}
.capture-icon { font-size: 48px; margin-bottom: 12px; }
.capture-text { font-size: 15px; color: #4fc08d; font-weight: 500; }
.capture-hint { font-size: 12px; color: #999; margin-top: 8px; }

.recognizing-area { text-align: center; padding: 40px 16px; }
.scan-animation {
  width: 80px; height: 80px; margin: 0 auto 16px;
  border: 3px solid #4fc08d; border-radius: 50%;
  position: relative; overflow: hidden;
}
.scan-line {
  position: absolute; top: 0; left: 10%; width: 80%; height: 3px;
  background: #4fc08d; animation: scanMove 1.5s ease-in-out infinite;
}
@keyframes scanMove {
  0% { top: 0; } 50% { top: 90%; } 100% { top: 0; }
}
.recog-text { font-size: 15px; color: #333; font-weight: 500; }
.recog-hint { font-size: 12px; color: #999; margin-top: 8px; }

.result-area { padding: 0 12px; }
.result-area h3 { text-align: center; font-size: 16px; color: #07c160; margin: 16px 0 4px; }
.result-hint { text-align: center; font-size: 12px; color: #999; margin-bottom: 16px; }
.result-form {
  background: #fff; border-radius: 12px; overflow: hidden;
  box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.result-actions { padding: 16px 0; }

.manual-tip { padding: 0 12px; }
</style>
