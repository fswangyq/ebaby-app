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
