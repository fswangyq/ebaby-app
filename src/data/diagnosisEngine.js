/**
 * EBaby v3.0 辨证引擎
 * 纯函数，无副作用
 *
 * 输入：answers（用户问诊答案） + medicineList（药库）
 * 输出：{ patterns[], fever, age, recommendations, redFlags }
 *
 * 算法：症状加权 → 证型匹配 → 互斥过滤 → 药品评分 → 排序推荐
 */

import { PATTERN_TYPES, FEVER_LEVELS, AGE_DOSAGE, RED_FLAGS } from './diagnosisData.js'

/**
 * 主入口：执行完整辨证
 * @param {Object} answers - 问诊答案，key=步骤id，value=选项value
 * @param {Array}  medicineList - 药库列表（medicineData.js）
 * @returns {Object} 辨证结果
 */
export function runDiagnosis(answers, medicineList) {
  const age = answers.age || '3-6'
  const feverLevel = resolveFeverLevel(answers)

  // 1. 计算每个证型的得分
  const scored = calculatePatternScores(answers)

  // 2. 互斥过滤
  const filtered = applyExclusions(scored, answers)

  // 3. 排序取前N
  const sorted = filtered.sort((a, b) => b.score - a.score)
  const topPattern = sorted[0] || null
  const secondaryPatterns = sorted.slice(1, 3) // 备选证型

  // 4. 安全红线检测
  const redFlags = checkRedFlags(answers)

  // 5. 药品推荐
  const recommendations = recommendMedicines({
    answers,
    topPattern,
    secondaryPatterns,
    medicineList,
    age,
  })

  return {
    age,
    feverLevel,
    topPattern,
    secondaryPatterns: secondaryPatterns.filter(p => p.score > 0),
    allScores: sorted.filter(p => p.score > 0),
    recommendations,
    redFlags,
    feverBanner: FEVER_LEVELS[feverLevel] || null,
    ageDosage: AGE_DOSAGE[age] || null,
  }
}

// ========== ① 证型评分 ==========

function calculatePatternScores(answers) {
  return PATTERN_TYPES.map(pt => {
    let score = 0
    const matchedRules = []

    for (const rule of pt.matchRules) {
      const answerValue = answers[rule.factor]
      if (answerValue === rule.value) {
        score += rule.score
        matchedRules.push({ factor: rule.factor, value: answerValue, score: rule.score })
      }
    }

    // 复合证型优待：多个方向同时命中
    const uniqueFactors = [...new Set(matchedRules.map(r => r.factor))]
    if (uniqueFactors.length >= 3) {
      score += 2
      matchedRules.push({ factor: '_bonus', value: 'composite', score: 2 })
    }

    return {
      ...pt,
      score,
      matchedRules,
      matchedFactors: uniqueFactors,
    }
  })
}

// ========== ② 互斥过滤 ==========

function applyExclusions(scored, answers) {
  const chillHeat = answers.chill_heat
  const hasHeat = chillHeat === 'heat' || chillHeat === 'alternate'
  const hasCold = chillHeat === 'chill'

  return scored.map(item => {
    let excluded = false
    const exclusionReasons = []

    // 规则驱动互斥
    for (const exId of item.excludePatterns) {
      const exPattern = PATTERN_TYPES.find(p => p.id === exId)
      if (!exPattern) continue

      // 检查是否有任何排除证型的得分 > 0
      const exItem = scored.find(s => s.id === exId)
      if (exItem && exItem.score > 0) {
        excluded = true
        exclusionReasons.push(`被【${exPattern.name}】互斥（排除规则）`)
      }
    }

    // 寒热互斥：热证命中 → 屏蔽寒证
    if (hasHeat && ['wind_cold', 'mahuang', 'guizhi', 'cold-with-food'].includes(item.id)) {
      excluded = true
      exclusionReasons.push('热证已命中，屏蔽寒证')
    }

    // 寒热互斥：寒证命中 → 屏蔽热证
    if (hasCold && ['wind_heat', 'damp-heat', 'phlegm_heat', 'food-with-heat'].includes(item.id)) {
      excluded = true
      exclusionReasons.push('寒证已命中，屏蔽热证')
    }

    // 麻黄↔桂枝互斥（双向）
    if (item.id === 'mahuang') {
      const guizhiScore = scored.find(s => s.id === 'guizhi')
      if (guizhiScore && guizhiScore.score > 0) {
        excluded = true
        exclusionReasons.push('与【桂枝汤证】互斥，取高分者')
      }
    }
    if (item.id === 'guizhi') {
      const mahuangScore = scored.find(s => s.id === 'mahuang')
      if (mahuangScore && mahuangScore.score > 0) {
        excluded = true
        exclusionReasons.push('与【麻黄汤证】互斥，取高分者')
      }
    }

    return { ...item, excluded, exclusionReasons }
  })
}

// ========== ③ 发热等级判定 ==========

function resolveFeverLevel(answers) {
  const main = answers.main_symptom
  const level = answers.fever_level

  // 主症不是发烧，且没有发烧等级 → 不发烧
  if (!level || level === 'no_fever') return 'no_fever'

  // 明确等级直接返回
  if (['low_fever', 'mid_fever', 'high_fever'].includes(level)) return level

  // 发烧但不清楚度数 → 保守推断
  if (level === 'fever_unknown') {
    // 根据其他症状保守推断为"中热"，防止误判
    return 'unknown'
  }

  return 'no_fever'
}

// ========== ④ 药品推荐 ==========

function recommendMedicines({ answers, topPattern, secondaryPatterns, medicineList, age }) {
  if (!topPattern || topPattern.score === 0) {
    return { primary: null, alternatives: [], reason: '未能明确辨证，建议咨询医生' }
  }

  // 计算每个药品的匹配分
  const scoredMeds = medicineList.map(med => {
    let score = 0
    const reasons = []

    // —— 症状命中分 ——
    // 遍历药品的功效标签，与用户答案匹配
    const tags = med.tags || []
    const answersStr = JSON.stringify(answers)

    // 简单关键词匹配（基于 tags）
    for (const tag of tags) {
      if (answersStr.includes(tag)) {
        score += 2
        reasons.push(`功效「${tag}」与症状匹配`)
      }
    }

    // —— 证型加权分 ——
    const patternBonus = getPatternMedicineBonus(topPattern.id, med)
    score += patternBonus
    if (patternBonus > 0) {
      reasons.push(`【${topPattern.name}】推荐权重 +${patternBonus}`)
    }

    // —— 年龄罚分（0-3岁安全过滤）——
    const agePenalty = getAgePenalty(age, med)
    score += agePenalty
    if (agePenalty < 0) {
      reasons.push(`⚠️ ${age} 年龄安全罚分 ${agePenalty}`)
    }

    // —— 复合证型优待：备选证型药品也加分 ——
    for (const sp of secondaryPatterns) {
      if (sp.score > 0) {
        const bonus = getPatternMedicineBonus(sp.id, med)
        if (bonus > 0) {
          score += 1
          reasons.push(`备选证型【${sp.name}】微弱相关 +1`)
        }
      }
    }

    return { ...med, score, reasons: [...new Set(reasons)] }
  })

  // 过滤禁用药品
  const safeMeds = scoredMeds.filter(m => {
    if (age === '0-3' && m.ageForbidden && m.ageForbidden.includes('0-3')) return false
    return true
  })

  // 排序
  const ranked = safeMeds.sort((a, b) => b.score - a.score)
  const primary = ranked[0] && ranked[0].score > 0 ? ranked[0] : null
  const alternatives = ranked.slice(1, 4).filter(m => m.score > 0)

  return {
    primary,
    alternatives,
    allRanked: ranked.filter(m => m.score > 0),
    reason: primary
      ? buildRecommendationReason(primary, topPattern, answers)
      : '未能找到合适的推荐药品，建议咨询医生',
  }
}

// 证型 → 药品加权映射（简化版，实际以 medicineData.js 的 tags 为准）
function getPatternMedicineBonus(patternId, med) {
  const mapping = {
    'wind_heat':       ['风热', '清热', '感冒', '咽痛'],
    'wind_cold':       ['风寒', '感冒', '止咳', '解表'],
    'damp-heat':       ['湿热', '暑湿', '祛湿', '清热'],
    'cold-with-food':   ['积食', '消食', '腹胀', '感冒'],
    'food-with-heat':   ['积食', '清热', '消食', '通便'],
    'shaoyang':         ['少阳', '和解', '小柴胡'],
    'flu-high':         ['流感', '清热', '解毒', '退热'],
    'mahuang':          ['麻黄', '无汗', '恶寒', '身痛'],
    'guizhi':           ['桂枝', '有汗', '怕风', '解表'],
    'phlegm_heat':      ['痰热', '咳嗽', '黄痰', '清热'],
    'dry_cough':        ['燥咳', '干咳', '润肺', '养阴'],
  }

  const keywords = mapping[patternId]
  if (!keywords) return 0

  const medTags = med.tags || []
  const medName = med.name || ''
  let bonus = 0

  for (const kw of keywords) {
    if (medTags.some(t => t.includes(kw) || kw.includes(t))) {
      bonus += 2
    }
    if (medName.includes(kw)) {
      bonus += 1
    }
  }

  return Math.min(bonus, 6) // 上限+6
}

// 年龄安全罚分
function getAgePenalty(age, med) {
  if (age !== '0-3') return 0

  let penalty = 0
  const name = med.name || ''
  const tags = med.tags || []

  // 麻黄类：婴幼儿慎用
  if (name.includes('麻黄') || tags.some(t => t.includes('麻黄'))) {
    penalty -= 2
  }
  // 大黄类：婴幼儿泻下太猛
  if (name.includes('大黄') || tags.some(t => t.includes('大黄') || t.includes('泻下'))) {
    penalty -= 1
  }

  return penalty
}

// 生成推荐理由
function buildRecommendationReason(med, pattern, answers) {
  const lines = []
  lines.push(`🩺 辨证结果：${pattern.name}（匹配度 ${pattern.score} 分）`)
  lines.push('')
  lines.push(`💊 推荐药品：${med.name}`)
  lines.push(`   功效：${med.efficacy || '参见说明书'}`)
  if (med.dosage) {
    lines.push(`   参考用量：${med.dosage}`)
  }
  lines.push('')
  lines.push('📋 推荐依据：')
  for (const r of med.reasons.slice(0, 3)) {
    lines.push(`   · ${r}`)
  }
  return lines.join('\n')
}

// ========== ⑤ 安全红线 ==========

function checkRedFlags(answers) {
  const flags = []

  for (const rf of RED_FLAGS) {
    const val = answers[rf.condition]
    if (val === rf.value) {
      // 检查组合条件
      if (rf.combine) {
        const [cond, expected] = rf.combine.split(':')
        if (answers[cond] !== expected) continue
      }
      flags.push(rf.message)
    }
  }

  // 额外：高热 + 嗜睡 → 强烈建议就医
  if (answers.fever_level === 'high_fever' && answers.spirit === 'sleepy') {
    flags.push('⚠️ 高热伴嗜睡，可能是严重感染，请立即就医！')
  }

  return flags
}

// ========== 导出 ==========

export {
  calculatePatternScores,
  applyExclusions,
  resolveFeverLevel,
  recommendMedicines,
  checkRedFlags,
}
