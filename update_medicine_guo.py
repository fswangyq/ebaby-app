#!/usr/bin/env python3
"""
基于郭生白本能论方案批量更新EBaby药品数据库
更新字段：fit_symptom, baby_taboo, diet_note
"""
import re
import json

# 读取medicineData.js文件
with open('src/data/medicineData.js', 'r', encoding='utf-8') as f:
    content = f.read()

# 郭生白方案中的关键辨证关键词映射
guo_shengbai_keywords = {
    '小儿豉翘清热颗粒': {
        'fit_symptom_add': ',风热感冒,高热,口渴,微恶风,舌尖红,苔薄黄,便秘,腹胀',
        'baby_taboo_add': '⚠️ 郭生白提示：此为风热/阳明感冒用药，风寒感冒（清涕、怕冷、无汗）禁用。发热期间须多饮温水保护津液。',
        'diet_note_add': '郭生白本能论：发热期间保护津液，多喝温水，饮食清淡稀软。忌鸡蛋、牛奶（易生痰热）。大便通畅热自退。'
    },
    '小儿肺热咳喘口服液': {
        'fit_symptom_add': ',痰热咳嗽,黄稠痰,气喘,肺热,舌尖红,苔黄腻,口渴',
        'baby_taboo_add': '⚠️ 郭生白提示：风寒咳嗽（白稀痰、怕冷）禁用！咳嗽是排异反应，不能强行止咳，需帮助肺排痰热。',
        'diet_note_add': '郭生白本能论：多喝温水稀释痰液，帮助肺完成排痰排异。保持室内湿度，轻拍后背助排痰。忌甜食生痰。'
    },
    '通宣理肺口服液': {
        'fit_symptom_add': ',风寒咳嗽,白稀痰,恶寒,无汗,头痛,鼻塞清涕,肢体酸痛',
        'baby_taboo_add': '⚠️ 郭生白提示：风热咳嗽（黄稠痰、咽痛）禁用！风寒咳嗽忌用寒凉止咳药（如川贝枇杷膏），越用越咳。',
        'diet_note_add': '郭生白本能论：服药后喝温热水助汗，盖薄被微微发汗即可，不可大汗伤津。注意保暖避风。饮食忌生冷寒凉。'
    },
    '小柴胡颗粒': {
        'fit_symptom_add': ',少阳感冒,寒热往来,胸胁苦满,心烦喜呕,口苦咽干,脉弦',
        'baby_taboo_add': '⚠️ 郭生白提示：小柴胡汤是"和法"代表，不是发汗也不是攻下，而是调节身体自身的枢机。纯风寒（无忽冷忽热）或纯风热（高热咽痛）不适用。',
        'diet_note_add': '郭生白本能论：和解表里，助少阳枢机运转。饮食以清淡稀饭面条为主，少食多餐。注意休息，避免剧烈活动。'
    },
    '桂枝颗粒': {
        'fit_symptom_add': ',风寒表虚,恶风,有汗,头痛,发热轻,鼻鸣干呕,脉浮缓',
        'baby_taboo_add': '⚠️ 郭生白提示：此为风寒表虚证（有汗）专用！风寒表实证（无汗）应选用麻黄汤类（如风寒感冒颗粒）。辨证关键：有汗 vs 无汗。',
        'diet_note_add': '郭生白本能论：服药后喝热稀粥一碗助汗（核心操作！），盖薄被微汗即可，不可大汗伤津。桂枝汤证是身体尝试发汗但汗出不畅，需助汗而非强发汗。'
    },
    '玉屏风颗粒': {
        'fit_symptom_add': ',肺气虚,表虚不固,自汗恶风,面色皓白,反复感冒,免疫力低',
        'baby_taboo_add': '⚠️ 郭生白提示：此为调理药，不是急性感冒用药！用于感冒痊愈后调理体质、减少复发。急性感染期（发热、咽痛）禁用。',
        'diet_note_add': '郭生白本能论：激活本能系统，调节生命三足鼎（免疫-内分泌-代谢）。平时可常服调理，配合适当运动增强体质。饮食营养均衡，忌生冷寒凉。'
    }
}

print("开始基于郭生白本能论方案更新药品数据库...")
print(f"共需更新 {len(guo_shengbai_keywords)} 个关键药品")

# 由于JS文件格式复杂，这里只输出需要手动更新的内容
print("\n" + "="*60)
print("请手动更新以下药品的字段：")
print("="*60)

for med_name, updates in guo_shengbai_keywords.items():
    print(f"\n【药品】{med_name}")
    print(f"  fit_symptom 增加: {updates['fit_symptom_add']}")
    print(f"  baby_taboo 增加: {updates['baby_taboo_add']}")
    print(f"  diet_note 增加: {updates['diet_note_add']}")

print("\n" + "="*60)
print("由于JS文件格式复杂，建议使用Edit工具逐个手动更新。")
print("或者，可以重新生成整个medicineData.js文件。")
print("="*60)
