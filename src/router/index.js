import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  // 封面入口
  {
    path: '/',
    name: 'Cover',
    component: () => import('../views/CoverView.vue'),
  },
  // 辨证问答
  {
    path: '/diagnose',
    name: 'Diagnose',
    component: () => import('../views/DiagnoseView.vue'),
  },
  // 辨证结果
  {
    path: '/result',
    name: 'Result',
    component: () => import('../views/ResultView.vue'),
  },
  // 家庭药库
  {
    path: '/medicine',
    name: 'Medicine',
    component: () => import('../views/MedicineView.vue'),
  },
  // 药品详情
  {
    path: '/medicine-detail/:id',
    name: 'MedicineDetail',
    component: () => import('../views/MedicineDetailView.vue'),
  },
  // 手动录入药品
  {
    path: '/add-medicine',
    name: 'AddMedicine',
    component: () => import('../views/AddMedicineView.vue'),
  },
  // 拍照OCR录入
  {
    path: '/ocr-add',
    name: 'OcrAdd',
    component: () => import('../views/OcrAddView.vue'),
  },
  // 试用到期 / 注册页
  {
    path: '/register',
    name: 'Register',
    component: () => import('../views/RegisterView.vue'),
  },
  // 兼容旧链接
  {
    path: '/trial-expired',
    redirect: '/register',
  },
  // 辨证知识库
  {
    path: '/knowledge',
    name: 'Knowledge',
    component: () => import('../views/KnowledgeView.vue'),
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
