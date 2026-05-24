<template>
  <div class="cover-wrap">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="leaf leaf-1">🍃</div>
      <div class="leaf leaf-2">🌿</div>
      <div class="leaf leaf-3">🍂</div>
      <div class="leaf leaf-4">🌱</div>
      <div class="leaf leaf-5">🍃</div>
    </div>

    <!-- 主卡片 -->
    <div class="cover-card" @click="goDiagnose">
      <!-- 顶部装饰线 -->
      <div class="top-line"></div>

      <!-- 图标区 -->
      <div class="icon-area">
        <div class="icon-circle">
          <span class="icon-herb">🌿</span>
        </div>
        <div class="icon-sub">辨症 · 查药 · 安心</div>
      </div>

      <!-- 标题区 -->
      <div class="title-area">
        <h1 class="app-name">儿宝伴侣</h1>
        <div class="divider">
          <span class="divider-line"></span>
          <span class="divider-icon">◆</span>
          <span class="divider-line"></span>
        </div>
        <h2 class="sub-title">辨症查药 · 安心育儿</h2>
      </div>

      <!-- 说明区 -->
      <div class="desc-area">
        <p class="desc-text">
          专为<strong>0～12 岁</strong>宝妈设计
        </p>
        <p class="desc-text">
          中医辨证 · 家用中成药推荐 · 分龄用量参考
        </p>
      </div>

      <!-- 版本信息 -->
      <div class="version-area">
        <span class="version-tag">v3.0</span>
        <span class="version-note"></span>
      </div>

      <!-- 主按钮 -->
      <div class="btn-area">
        <button class="start-btn" @click.stop="goDiagnose">
          <span class="btn-icon">🩺</span>
          <span class="btn-text">开始辨证</span>
          <span class="btn-arrow">→</span>
        </button>
      </div>

      <!-- 辅助入口 -->
      <div class="sub-links">
        <button class="sub-link" @click.stop="goMedicine">
          <span>💊</span>
          <span>药品中心</span>
        </button>
        <button class="sub-link" @click.stop="goKnowledge">
          <span>📚</span>
          <span>辨证知识库</span>
        </button>
      </div>

      <!-- 底部版权 -->
      <div class="footer-area">
        <span class="footer-text">二〇二六年五月 · 中式本草智能辨证</span>
      </div>

      <!-- 底部装饰线 -->
      <div class="bottom-line"></div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function goDiagnose() {
  router.push('/diagnose')
}

function goMedicine() {
  router.push('/medicine')
}

function goKnowledge() {
  router.push('/knowledge')
}
</script>

<style scoped>
/* ===== 页面背景 ===== */
.cover-wrap {
  min-height: 100vh;
  background: linear-gradient(160deg, #f8f4ee 0%, #f0ebe3 40%, #e8dfd5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  position: relative;
  overflow: hidden;
}

/* ===== 背景装饰叶片 ===== */
.bg-decoration {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}
.leaf {
  position: absolute;
  font-size: 28px;
  opacity: 0.12;
}
.leaf-1 { top: 8%;   left: 6%;  font-size: 40px; transform: rotate(-25deg); }
.leaf-2 { top: 18%;  right: 8%; font-size: 32px; transform: rotate(30deg); }
.leaf-3 { bottom: 22%; left: 10%; font-size: 36px; transform: rotate(-40deg); }
.leaf-4 { top: 40%;  left: 3%;  font-size: 24px; transform: rotate(15deg); opacity: 0.08; }
.leaf-5 { bottom: 12%; right: 5%; font-size: 44px; transform: rotate(-18deg); }

/* ===== 主卡片 ===== */
.cover-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 420px;
  background: linear-gradient(180deg, #fffdf8 0%, #ffffff 100%);
  border-radius: 24px;
  box-shadow:
    0 8px 32px rgba(139, 119, 86, 0.13),
    0 2px 8px rgba(139, 119, 86, 0.08);
  padding: 0;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  overflow: hidden;
  border: 1px solid rgba(139, 119, 86, 0.10);
}
.cover-card:hover {
  transform: translateY(-3px);
  box-shadow:
    0 14px 40px rgba(139, 119, 86, 0.18),
    0 4px 12px rgba(139, 119, 86, 0.10);
}
.cover-card:active {
  transform: scale(0.985);
}

/* ===== 顶部装饰线 ===== */
.top-line {
  height: 5px;
  background: linear-gradient(90deg, #8c7853 0%, #c4a265 50%, #8c7853 100%);
  border-radius: 24px 24px 0 0;
}

/* ===== 图标区 ===== */
.icon-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 36px;
  margin-bottom: 8px;
}
.icon-circle {
  width: 88px;
  height: 88px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f0ebe3 0%, #e8dfd5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(139, 119, 86, 0.15);
  border: 3px solid #d4c5a9;
}
.icon-herb {
  font-size: 44px;
  filter: saturate(1.2);
}
.icon-sub {
  margin-top: 10px;
  font-size: 13px;
  color: #8c7853;
  letter-spacing: 6px;
  font-weight: 500;
}

/* ===== 标题区 ===== */
.title-area {
  text-align: center;
  padding: 16px 24px 0;
}
.app-name {
  font-size: 32px;
  font-weight: 800;
  color: #4a3728;
  margin: 0;
  letter-spacing: 4px;
  font-family: 'STKaiti', 'KaiTi', 'SimSun', serif;
}
.divider {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 12px 0;
}
.divider-line {
  display: inline-block;
  width: 48px;
  height: 1.5px;
  background: linear-gradient(90deg, transparent, #c4a265, transparent);
}
.divider-icon {
  color: #c4a265;
  font-size: 10px;
}
.sub-title {
  font-size: 16px;
  font-weight: 600;
  color: #8c7853;
  margin: 0;
  letter-spacing: 3px;
  font-family: 'STKaiti', 'KaiTi', serif;
}

/* ===== 说明区 ===== */
.desc-area {
  text-align: center;
  padding: 12px 32px 0;
}
.desc-text {
  font-size: 14px;
  color: #7a6b54;
  margin: 4px 0;
  line-height: 1.7;
}
.desc-text strong {
  color: #4a3728;
}

/* ===== 版本信息 ===== */
.version-area {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 14px 0 0;
}
.version-tag {
  display: inline-block;
  background: linear-gradient(135deg, #d46b08, #f5a623);
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: 10px;
  letter-spacing: 1px;
}
.version-note {
  font-size: 12px;
  color: #b5a48a;
}

/* ===== 辅助入口 ===== */
.sub-links {
  display: flex;
  gap: 12px;
  padding: 16px 32px 0;
}
.sub-link {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 0;
  border: 1.5px solid #d4c5a9;
  border-radius: 12px;
  background: #fffdf8;
  color: #4a3728;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}
.sub-link:hover {
  border-color: #c4a265;
  background: #f8f4ee;
  transform: translateY(-1px);
}
.sub-link:active {
  transform: scale(0.97);
}

/* ===== 底部按钮 ===== */
.btn-area {
  padding: 24px 32px 0;
}
.start-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px 0;
  border: none;
  border-radius: 16px;
  background: linear-gradient(135deg, #8c7853 0%, #a88c5e 100%);
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s ease, transform 0.15s ease;
  letter-spacing: 2px;
  box-shadow: 0 4px 16px rgba(139, 119, 86, 0.25);
}
.start-btn:hover {
  background: linear-gradient(135deg, #7a6745 0%, #8c7853 100%);
  transform: scale(1.02);
}
.start-btn:active {
  transform: scale(0.97);
}
.btn-icon {
  font-size: 22px;
}
.btn-text {
  font-family: 'STKaiti', 'KaiTi', serif;
}
.btn-arrow {
  font-size: 18px;
  opacity: 0.7;
  transition: transform 0.2s ease;
}
.start-btn:hover .btn-arrow {
  transform: translateX(4px);
}

/* ===== 底部版权 ===== */
.footer-area {
  text-align: center;
  padding: 18px 0 4px;
}
.footer-text {
  font-size: 11px;
  color: #c4b99a;
  letter-spacing: 2px;
}

/* ===== 底部装饰线 ===== */
.bottom-line {
  height: 4px;
  background: linear-gradient(90deg, #8c7853 0%, #c4a265 50%, #8c7853 100%);
  border-radius: 0 0 24px 24px;
}
</style>
