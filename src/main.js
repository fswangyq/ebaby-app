import { createApp } from 'vue'
import Vant from 'vant'
import 'vant/lib/index.css'
import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import './style.css'

const app = createApp(App)
const pinia = createPinia()

app.use(Vant)
app.use(router)
app.use(pinia)
app.mount('#app')

// 隐藏诊断层
const diagEl = document.getElementById('diag-status')
if (diagEl) {
  diagEl.style.display = 'none'
}
