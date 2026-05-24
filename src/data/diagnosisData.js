/**
 * EBaby v3.0 辨证数据配置
 * 中式本草风 · 商用标准
 *
 * 内容正确性第一，UI美观第二
 * 所有辨证分类依据：《伤寒论》《金匮要略》经方体系
 * 参考：本能论（郭生白）+ 温病派 + 日本汉方
 */

// ========== 一、问答步骤配置 ==========
// 每一步对应一个问诊维度，按顺序推进
// type: radio（单选）/ input（输入）/ radio-multi（多选）
export const DIAGNOSIS_STEPS = [
  {
    id: 'age',
    title: '宝宝多大了？',
    subtitle: '不同年龄段用药剂量不同，请准确选择',
    icon: '👶',
    type: 'radio',
    options: [
      { value: '0-3',  label: '0～3 岁',  desc: '婴幼儿，用药需格外谨慎' },
      { value: '3-6',  label: '3～6 岁',  desc: '学龄前，剂量适中' },
      { value: '6-12', label: '6～12 岁', desc: '学龄，接近成人剂量' },
    ],
  },
  {
    id: 'main_symptom',
    title: '最主要的不舒服是什么？',
    subtitle: '选最明显的一个主症',
    icon: '🩺',
    type: 'radio',
    options: [
      { value: 'fever',      label: '发烧',       desc: '体温升高为主' },
      { value: 'cough',      label: '咳嗽',       desc: '咳嗽为主，可能伴痰' },
      { value: 'cold',        label: '感冒',       desc: '鼻塞流涕打喷嚏' },
      { value: 'indigestion', label: '积食',       desc: '腹胀口臭食欲不振' },
      { value: 'diarrhea',    label: '腹泻',       desc: '大便稀溏次数多' },
      { value: 'other',       label: '其他',       desc: '以上都不是' },
    ],
  },
  {
    id: 'fever_level',
    title: '有没有发烧？体温大概多少？',
    subtitle: '选最接近的档位，无需精确数字',
    icon: '🌡️',
    type: 'radio',
    triggerValue: 'fever',  // 只有主症选fever时才问
    options: [
      { value: 'no_fever',    label: '不发烧',     desc: '体温正常' },
      { value: 'low_fever',    label: '低烧 37.5～38.4℃',  desc: '精神尚可，物理降温为主' },
      { value: 'mid_fever',    label: '中烧 38.5～39.4℃',  desc: '可考虑退烧药，需观察' },
      { value: 'high_fever',   label: '高烧 ≥39.5℃',      desc: '⚠️ 建议尽快就医' },
      { value: 'fever_unknown',label: '发烧但不清楚度数', desc: '无法量体温时选此项' },
    ],
  },
  {
    id: 'chill_heat',
    title: '怕冷还是怕热？',
    subtitle: '观察宝宝盖被子的反应',
    icon: '🌡️',
    type: 'radio',
    options: [
      { value: 'chill',         label: '怕冷',       desc: '盖被子还想加盖，吹风不舒服' },
      { value: 'heat',          label: '怕热',       desc: '踢被子，喜欢凉快' },
      { value: 'alternate',     label: '忽冷忽热',   desc: '一阵冷一阵热，可能是少阳证' },
      { value: 'not_obvious',   label: '不明显',     desc: '看不出明显偏好' },
    ],
  },
  {
    id: 'sweat',
    title: '出汗情况怎么样？',
    subtitle: '观察白天安静状态下的出汗',
    icon: '💧',
    type: 'radio',
    options: [
      { value: 'no_sweat',     label: '不出汗',     desc: '皮肤干，即使应该出汗的时候也没有' },
      { value: 'light_sweat',   label: '微汗',       desc: '皮肤湿润，没有汗珠' },
      { value: 'heavy_sweat',   label: '多汗',       desc: '一动就出汗，或夜里盗汗' },
      { value: 'normal_sweat',  label: '正常',       desc: '和运动/天气匹配，不多不少' },
    ],
  },
  {
    id: 'runny_nose',
    title: '流什么鼻涕？',
    subtitle: '看鼻涕颜色和稠度',
    icon: '👃',
    type: 'radio',
    options: [
      { value: 'clear',    label: '清鼻涕',   desc: '透明水样，像水一样' },
      { value: 'yellow',    label: '黄鼻涕',   desc: '黄色黏稠，可能有热' },
      { value: 'white',     label: '白黏鼻涕', desc: '白色黏稠，不太清也不太黄' },
      { value: 'no_runny', label: '不流鼻涕', desc: '鼻子干干的' },
    ],
  },
  {
    id: 'cough_sputum',
    title: '咳嗽有痰吗？什么颜色？',
    subtitle: '听咳嗽声音，看能不能咳出痰',
    icon: '😷',
    type: 'radio',
    options: [
      { value: 'dry_cough',    label: '干咳无痰',   desc: '咳嗽声干，没有痰音' },
      { value: 'white_sputum', label: '白痰/清痰',  desc: '痰白稀，容易咳出' },
      { value: 'yellow_sputum',label: '黄痰/稠痰',  desc: '痰黄黏，咳不出来' },
      { value: 'no_cough',     label: '不咳嗽',     desc: '没有咳嗽症状' },
    ],
  },
  {
    id: 'throat',
    title: '咽喉怎么样？',
    subtitle: '看宝宝有没有咽喉不适的表现',
    icon: '�咽喉',
    type: 'radio',
    options: [
      { value: 'normal',       label: '正常',       desc: '不红肿，不痛' },
      { value: 'red_sore',     label: '红肿疼痛',   desc: '咽喉红，可能发烧' },
      { value: 'dry_throat',   label: '咽喉发干',   desc: '总觉得嗓子不舒服' },
      { value: 'not_checked',  label: '没看',       desc: '不方便查看' },
    ],
  },
  {
    id: 'tongue',
    title: '舌苔什么样子？',
    subtitle: '看舌头颜色和苔的厚薄',
    icon: '👅',
    type: 'radio',
    options: [
      { value: 'white_thin',    label: '白薄苔',   desc: '舌苔白，薄薄一层，属寒/正常' },
      { value: 'yellow_thin',   label: '黄薄苔',   desc: '舌苔黄，薄，属热' },
      { value: 'thick_greasy',  label: '厚腻苔',   desc: '苔厚腻，可能是湿热/积食' },
      { value: 'map_tongue',    label: '地图舌',   desc: '舌苔剥落，可能是阴虚/脾虚' },
      { value: 'not_checked',   label: '没看',     desc: '不方便查看' },
    ],
  },
  {
    id: 'stool',
    title: '大便怎么样？',
    subtitle: '看大便形状和次数',
    icon: '💩',
    type: 'radio',
    options: [
      { value: 'normal_stool',  label: '正常',       desc: '每天1-2次，成形' },
      { value: 'constipation',  label: '干结/便秘',  desc: '大便干硬，2天以上一次' },
      { value: 'loose_stool',   label: '稀溏',       desc: '不成形，但次数不多' },
      { value: 'diarrhea_stool',label: '腹泻',       desc: '次数多，水样/糊状' },
      { value: 'sticky_stool',  label: '黏腻不爽',   desc: '黏马桶，擦不干净，可能有湿热' },
    ],
  },
  {
    id: 'appetite',
    title: '吃饭胃口怎么样？',
    subtitle: '观察最近几天的食欲变化',
    icon: '🍚',
    type: 'radio',
    options: [
      { value: 'normal_appetite', label: '正常',     desc: '吃饭和平时一样' },
      { value: 'no_appetite',     label: '没胃口',   desc: '不想吃饭，吃几口就不吃了' },
      { value: 'bloat_appetite',   label: '腹胀/口臭', desc: '肚子胀，嘴里有味，可能是积食' },
      { value: 'thirsty',          label: '口渴喜饮', desc: '总想喝水，可能是热证' },
    ],
  },
  {
    id: 'spirit',
    title: '精神状态怎么样？',
    subtitle: '观察宝宝清醒时的精神状态',
    icon: '😊',
    type: 'radio',
    options: [
      { value: 'normal_spirit',  label: '正常',     desc: '能玩能笑，和平时一样' },
      { value: 'lethargic',      label: '有点蔫',   desc: '不太爱动，但还能玩' },
      { value: 'irritable',      label: '烦躁哭闹',  desc: '一碰就哭，可能是发热/咽痛' },
      { value: 'sleepy',         label: '嗜睡',      desc: '总是想睡，叫醒后很快又睡' },
    ],
  },
]

// ========== 二、快捷辨证入口 ==========
// 常见症状群，一键跳过逐题问答
export const QUICK_PATTERNS = [
  {
    id: 'wind-cold',
    label: '风寒感冒',
    desc: '怕冷、清鼻涕、不出汗',
    icon: '🥶',
    answers: {
      main_symptom: 'cold',
      chill_heat: 'chill',
      sweat: 'no_sweat',
      runny_nose: 'clear',
      cough_sputum: 'white_sputum',
      throat: 'normal',
    },
  },
  {
    id: 'wind-heat',
    label: '风热感冒',
    desc: '怕热、黄鼻涕、咽喉红肿',
    icon: '🔥',
    answers: {
      main_symptom: 'cold',
      chill_heat: 'heat',
      sweat: 'light_sweat',
      runny_nose: 'yellow',
      cough_sputum: 'yellow_sputum',
      throat: 'red_sore',
    },
  },
  {
    id: 'food-accumulation',
    label: '积食发热',
    desc: '腹胀口臭、便秘或大便臭',
    icon: '🍖',
    answers: {
      main_symptom: 'indigestion',
      appetite: 'bloat_appetite',
      stool: 'constipation',
      spirit: 'lethargic',
    },
  },
  {
    id: 'summer-damp',
    label: '暑湿感冒',
    desc: '身热不扬、舌苔厚腻、大便黏',
    icon: '🌧️',
    answers: {
      main_symptom: 'fever',
      fever_level: 'low_fever',
      tongue: 'thick_greasy',
      stool: 'sticky_stool',
      sweat: 'heavy_sweat',
    },
  },
  {
    id: 'flu-high',
    label: '流感高热',
    desc: '突然高烧、浑身酸痛、咽喉剧痛',
    icon: '🤒',
    answers: {
      main_symptom: 'fever',
      fever_level: 'high_fever',
      chill_heat: 'alternate',
      throat: 'red_sore',
      spirit: 'lethargic',
    },
  },
  {
    id: 'cold-with-food',
    label: '风寒挟积食',
    desc: '怕冷清涕 + 腹胀口臭',
    icon: '🥣',
    answers: {
      main_symptom: 'cold',
      chill_heat: 'chill',
      runny_nose: 'clear',
      appetite: 'bloat_appetite',
      stool: 'constipation',
    },
  },
]

// ========== 三、证型定义（11证型 + 四级权重）==========
// 权重依据：湿热暑湿(+8) > 复合证型(+6) > 基础证型(+4) > 久咳虚燥(+2)
// 每一项包含：name, weight, matchRules（命中规则）, excludePatterns（互斥）
export const PATTERN_TYPES = [
  // ===== +8 级（最高权重，湿热/暑湿，病情复杂需优先识别）=====
  {
    id: 'damp-heat',
    name: '湿热/暑湿感冒',
    weight: 8,
    color: '#d46b08',   // 深橙
    badge: '🔥 重',
    description: '身热不扬，头重如裹，舌苔厚腻，大便黏腻。多见于夏季或湿热环境。',
    matchRules: [
      { factor: 'tongue',      value: 'thick_greasy', score: 4 },
      { factor: 'stool',       value: 'sticky_stool',  score: 3 },
      { factor: 'sweat',      value: 'heavy_sweat',   score: 2 },
      { factor: 'fever_level', value: 'low_fever',    score: 1 },
      { factor: 'fever_level', value: 'mid_fever',    score: 1 },
    ],
    excludePatterns: ['wind_cold', 'mahuang', 'guizhi'],
  },

  // ===== +6 级（复合证型，多因素叠加）=====
  {
    id: 'cold-with-food',
    name: '风寒挟积食',
    weight: 6,
    color: '#c41d7f',   // 玫红
    badge: '⚡ 复合',
    description: '怕冷、清鼻涕等风寒表现，同时伴有腹胀、口臭、便秘等积食症状。小儿常见。',
    matchRules: [
      { factor: 'chill_heat', value: 'chill',          score: 3 },
      { factor: 'runny_nose', value: 'clear',           score: 2 },
      { factor: 'appetite',   value: 'bloat_appetite',  score: 3 },
      { factor: 'stool',      value: 'constipation',    score: 2 },
      { factor: 'sweat',      value: 'no_sweat',       score: 1 },
    ],
    excludePatterns: ['wind_heat', 'damp_heat', 'phlegm_heat'],
  },
  {
    id: 'food-with-heat',
    name: '积食挟风热',
    weight: 6,
    color: '#c41d7f',
    badge: '⚡ 复合',
    description: '发热、怕热、黄涕等风热表现，同时伴有腹胀、口臭、便秘等积食症状。',
    matchRules: [
      { factor: 'chill_heat', value: 'heat',            score: 3 },
      { factor: 'runny_nose', value: 'yellow',           score: 2 },
      { factor: 'appetite',   value: 'bloat_appetite',   score: 3 },
      { factor: 'stool',      value: 'constipation',     score: 2 },
      { factor: 'throat',     value: 'red_sore',         score: 1 },
    ],
    excludePatterns: ['wind_cold', 'mahuang', 'guizhi', 'damp_heat'],
  },
  {
    id: 'shaoyang',
    name: '少阳证（寒热往来）',
    weight: 6,
    color: '#722ed1',   // 紫色
    badge: '🫁 经方',
    description: '一阵冷一阵热，口苦咽干，胸胁苦满。出自《伤寒论》少阳病篇，小柴胡汤主之。',
    matchRules: [
      { factor: 'chill_heat', value: 'alternate',     score: 6 },
      { factor: 'throat',     value: 'dry_throat',    score: 2 },
      { factor: 'spirit',     value: 'lethargic',     score: 1 },
    ],
    excludePatterns: ['mahuang', 'wind_cold_pure'],
  },
  {
    id: 'flu-high',
    name: '流感病毒性高热',
    weight: 6,
    color: '#cf1322',   // 深红
    badge: '🚨 急',
    description: '突然高热，浑身酸痛，咽喉剧痛，精神萎靡。流感特征明显，需密切观察。',
    matchRules: [
      { factor: 'fever_level', value: 'high_fever',  score: 4 },
      { factor: 'fever_level', value: 'mid_fever',   score: 2 },
      { factor: 'throat',      value: 'red_sore',    score: 3 },
      { factor: 'spirit',      value: 'lethargic',   score: 2 },
      { factor: 'chill_heat',  value: 'alternate',   score: 1 },
    ],
    excludePatterns: ['wind_cold', 'mahuang', 'guizhi'],
  },

  // ===== +4 级（基础证型）=====
  {
    id: 'wind_heat',
    name: '风热感冒',
    weight: 4,
    color: '#f5222d',   // 红
    badge: '热',
    description: '发热重，怕冷轻，黄鼻涕，咽喉红肿，舌尖红。辛凉解表为主。',
    matchRules: [
      { factor: 'chill_heat',    value: 'heat',         score: 3 },
      { factor: 'runny_nose',    value: 'yellow',       score: 2 },
      { factor: 'throat',        value: 'red_sore',     score: 2 },
      { factor: 'cough_sputum',  value: 'yellow_sputum', score: 2 },
    ],
    excludePatterns: ['wind_cold', 'mahuang', 'guizhi', 'cold_with_food'],
  },
  {
    id: 'wind_cold',
    name: '风寒感冒',
    weight: 4,
    color: '#1668dc',   // 蓝
    badge: '寒',
    description: '怕冷重，发热轻，清鼻涕，白痰，不出汗。辛温解表为主。',
    matchRules: [
      { factor: 'chill_heat',   value: 'chill',         score: 3 },
      { factor: 'runny_nose',   value: 'clear',         score: 2 },
      { factor: 'cough_sputum', value: 'white_sputum',  score: 2 },
      { factor: 'sweat',        value: 'no_sweat',      score: 2 },
    ],
    excludePatterns: ['wind_heat', 'damp_heat', 'phlegm_heat', 'food_with_heat'],
  },
  {
    id: 'mahuang',
    name: '麻黄汤证（无汗重型）',
    weight: 4,
    color: '#0958d9',   // 深蓝
    badge: '🫁 经方',
    description: '恶寒重，发热，无汗，全身酸痛，咳嗽。麻黄汤主之。与桂枝汤互斥。',
    matchRules: [
      { factor: 'chill_heat', value: 'chill',      score: 3 },
      { factor: 'sweat',      value: 'no_sweat',   score: 4 },
      { factor: 'fever_level', value: 'mid_fever',  score: 1 },
      { factor: 'fever_level', value: 'high_fever', score: 2 },
    ],
    excludePatterns: ['guizhi', 'wind_heat', 'damp_heat', 'phlegm_heat'],
    mutuallyExclusiveWith: ['guizhi'],
  },
  {
    id: 'guizhi',
    name: '桂枝汤证（有汗怕风型）',
    weight: 4,
    color: '#1677ff',   // 中蓝
    badge: '🫁 经方',
    description: '发热，微汗，怕风，头痛，鼻塞。桂枝汤主之。与麻黄汤互斥。',
    matchRules: [
      { factor: 'chill_heat', value: 'chill',         score: 2 },
      { factor: 'sweat',      value: 'light_sweat',   score: 4 },
      { factor: 'runny_nose', value: 'clear',          score: 1 },
    ],
    excludePatterns: ['mahuang', 'wind_heat', 'damp_heat'],
    mutuallyExclusiveWith: ['mahuang'],
  },
  {
    id: 'phlegm_heat',
    name: '痰热咳嗽（黄痰）',
    weight: 4,
    color: '#d4380d',   // 橙红
    badge: '热',
    description: '咳嗽，黄稠痰，咽喉红，可能有发热。清热化痰为主。',
    matchRules: [
      { factor: 'cough_sputum', value: 'yellow_sputum', score: 4 },
      { factor: 'throat',        value: 'red_sore',     score: 2 },
      { factor: 'main_symptom',  value: 'cough',        score: 2 },
      { factor: 'chill_heat',    value: 'heat',          score: 1 },
    ],
    excludePatterns: ['wind_cold', 'mahuang', 'guizhi'],
  },

  // ===== +2 级（久咳虚燥，权重最低）=====
  {
    id: 'dry_cough',
    name: '久咳虚燥',
    weight: 2,
    color: '#8c8c8c',   // 灰
    badge: '虚',
    description: '咳嗽经久不愈，干咳少痰，咽干口燥，午后低热。养阴润肺为主。',
    matchRules: [
      { factor: 'cough_sputum', value: 'dry_cough',   score: 4 },
      { factor: 'throat',        value: 'dry_throat',  score: 2 },
      { factor: 'tongue',        value: 'map_tongue',  score: 2 },
    ],
    excludePatterns: ['wind_heat', 'wind_cold', 'mahuang', 'guizhi', 'damp_heat'],
  },
]

// ========== 四、发热分级定义 ==========
export const FEVER_LEVELS = {
  no_fever:    { label: '不发烧',   color: '#52c41a', icon: '✅', action: '正常护理，观察即可' },
  low_fever:   { label: '低热 37.5～38.4℃', color: '#fa8c16', icon: '🟠', action: '物理降温为主：温水擦浴、减少衣物、多喂水，暂可不服退烧药' },
  mid_fever:   { label: '中热 38.5～39.4℃', color: '#f5222d', icon: '🔴', action: '可考虑退烧药（对乙酰氨基酚/布洛芬），按体重给药，同时物理降温，密切观察' },
  high_fever:  { label: '高热 ≥39.5℃',     color: '#722ed1', icon: '🟣', action: '⚠️ 建议尽快就医，尤其是3岁以下宝宝。高热可能引发惊厥，请及时就诊' },
  unknown:     { label: '发烧（度数不明）',   color: '#faad14', icon: '⚠️', action: '无法判断发热程度，按中热处理较为安全，建议尽快测量体温' },
}

// ========== 五、年龄分段用量参考 ==========
export const AGE_DOSAGE = {
  '0-3': {
    label: '0～3 岁',
    note: '婴幼儿用药需格外谨慎，严格按体重计算剂量，建议在医生指导下使用',
    warn: '⚠️ 0-3岁婴幼儿肝肾代谢功能未完善，用药前务必核对说明书，或咨询儿科医生',
  },
  '3-6': {
    label: '3～6 岁',
    note: '学龄前儿童，剂量为成人1/3～1/2，需根据体重调整',
    warn: '注意：此年龄段宝宝可能不会准确表达不适症状，需家长细心观察',
  },
  '6-12': {
    label: '6～12 岁',
    note: '学龄儿童，剂量接近成人2/3～全量，具体参照药品说明书',
    warn: '提醒：大龄儿童可能隐瞒症状，询问时需耐心引导',
  },
}

// ========== 六、安全红线（必须就医的情况）==========
export const RED_FLAGS = [
  { condition: 'fever_level', value: 'high_fever',                         message: '体温≥39.5℃，建议尽快就医' },
  { condition: 'spirit',      value: 'sleepy',                             message: '宝宝出现嗜睡症状，需尽快就医' },
  { condition: 'spirit',      value: 'lethargic', combine: 'fever_level:mid_fever', message: '发热+精神萎靡，建议就医观察' },
  { condition: 'stool',       value: 'diarrhea_stool', combine: 'fever_level:high_fever', message: '高热+腹泻，警惕脱水，建议就医' },
]
