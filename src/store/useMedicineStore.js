import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { medicineData } from '../data/medicineData.js'

export const useMedicineStore = defineStore('medicine', () => {
  // 加载内置药库存覆写（用户可修改内置药的库存/保质期/存放位置）
  function loadOverrides() {
    try {
      const raw = localStorage.getItem('eb_preset_overrides')
      return raw ? JSON.parse(raw) : {}
    } catch { return {} }
  }

  function saveOverrides(overrides) {
    localStorage.setItem('eb_preset_overrides', JSON.stringify(overrides))
  }

  // 从localStorage加载用户自定义药品，与预制数据合并
  function loadMedicines() {
    const custom = localStorage.getItem('eb_custom_medicines')
    const customList = custom ? JSON.parse(custom) : []
    const overrides = loadOverrides()
    // 预制数据标记source: 'preset'，合并库存覆写
    const preset = medicineData.map(m => ({
      ...m,
      source: 'preset',
      stock: overrides[m.id]?.stock ?? 0,
      unit: overrides[m.id]?.unit ?? '袋/瓶',
      shelf_life: overrides[m.id]?.shelf_life ?? m.shelf_life ?? '',
      storage: overrides[m.id]?.storage ?? m.storage ?? ''
    }))
    return [...preset, ...customList]
  }

  const medicineList = ref(loadMedicines())

  // 添加自定义药品（含厂家/规格去重合并：同名+同厂家+同规格 → 合并库存，否则新增）
  function addMedicine(med) {
    const customList = JSON.parse(localStorage.getItem('eb_custom_medicines') || '[]')
    const newMfr = (med.manufacturer || '').trim()
    const newSpec = (med.spec || '').trim()

    // 先在自定义列表中查找同名+同厂家+同规格的已有药品
    const dupIdx = customList.findIndex(m =>
      m.name === med.name &&
      (m.manufacturer || '').trim() === newMfr &&
      (m.spec || '').trim() === newSpec
    )

    if (dupIdx >= 0) {
      // 合并库存
      const existing = customList[dupIdx]
      existing.stock = (existing.stock || 0) + (med.stock || 1)
      if (med.shelf_life) existing.shelf_life = med.shelf_life
      if (med.storage) existing.storage = med.storage
      if (med.unit) existing.unit = med.unit
      customList[dupIdx] = existing
    } else {
      const newMed = {
        ...med,
        id: 'custom_' + Date.now(),
        source: 'custom',
        manufacturer: newMfr,
        spec: newSpec
      }
      customList.push(newMed)
    }
    localStorage.setItem('eb_custom_medicines', JSON.stringify(customList))
    medicineList.value = loadMedicines()
  }

  // 更新药品（支持内置药库存覆写 + 自定义药品）
  function updateMedicine(id, data) {
    const med = medicineList.value.find(m => String(m.id) === String(id))
    if (!med) return

    if (med.source === 'custom') {
      const customList = JSON.parse(localStorage.getItem('eb_custom_medicines') || '[]')
      const idx = customList.findIndex(m => m.id === id)
      if (idx >= 0) {
        customList[idx] = { ...customList[idx], ...data }
        localStorage.setItem('eb_custom_medicines', JSON.stringify(customList))
      }
    } else {
      // 内置药：库存/保质期/存放位置写入覆写层
      const overrides = loadOverrides()
      overrides[id] = {
        stock: data.stock ?? overrides[id]?.stock ?? 0,
        unit: data.unit ?? overrides[id]?.unit ?? '袋/瓶',
        shelf_life: data.shelf_life ?? overrides[id]?.shelf_life ?? '',
        storage: data.storage ?? overrides[id]?.storage ?? ''
      }
      saveOverrides(overrides)
    }
    medicineList.value = loadMedicines()
  }

  // 删除药品（仅自定义）
  function deleteMedicine(id) {
    let customList = JSON.parse(localStorage.getItem('eb_custom_medicines') || '[]')
    customList = customList.filter(m => m.id !== id)
    localStorage.setItem('eb_custom_medicines', JSON.stringify(customList))
    medicineList.value = loadMedicines()
  }

  // 从家庭药库移除（自定义药品真删除，预设药品设库存为0）
  function removeFromCabinet(id) {
    const med = medicineList.value.find(m => String(m.id) === String(id))
    if (!med) return
    if (med.source === 'custom') {
      deleteMedicine(id)
    } else {
      updateMedicine(id, { stock: 0 })
    }
  }

  // 按症状搜索
  function searchBySymptom(symptom, ageGroup) {
    return medicineList.value.filter(m => {
      if (!m.fit_symptom) return false
      const fit = m.fit_symptom.toLowerCase()
      return fit.includes(symptom.toLowerCase())
    })
  }

  // 获取临期药品（30天内过期）
  function getExpiringSoon(days = 30) {
    const now = new Date()
    return medicineList.value.filter(m => {
      if (!m.shelf_life) return false
      // 支持 "2027-01-01" 格式
      const exp = new Date(m.shelf_life)
      if (isNaN(exp.getTime())) return false // 无法解析的忽略
      const diff = (exp - now) / (1000 * 60 * 60 * 24)
      return diff >= 0 && diff <= days
    })
  }

  // 按ID获取
  function getById(id) {
    return medicineList.value.find(m => String(m.id) === String(id))
  }

  // ===== 家庭药库：仅显示有库存的药品 =====
  const cabinetMedicines = computed(() =>
    medicineList.value.filter(m => (m.stock || 0) > 0)
  )

  // 常用药参考：全部预设药品（不含自定义）的原始数据
  const referenceMedicines = computed(() =>
    medicineList.value.filter(m => m.source === 'preset')
  )

  // 从常用药加入家庭药库（累加库存，不覆盖已有数量）
  function addToCabinet(id, stock = 1, unit = '袋/瓶') {
    const med = medicineList.value.find(m => String(m.id) === String(id))
    if (!med) return false
    const currentStock = med.stock || 0
    updateMedicine(id, { stock: currentStock + stock, unit })
    return true
  }

  return {
    medicineList,
    addMedicine,
    updateMedicine,
    deleteMedicine,
    searchBySymptom,
    getExpiringSoon,
    getById,
    loadMedicines,
    cabinetMedicines,
    referenceMedicines,
    addToCabinet,
    removeFromCabinet
  }
})
