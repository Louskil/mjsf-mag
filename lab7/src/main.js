import { createApp } from 'vue'
import { pinia } from './stores/index.js'
import App from './App.vue'
import { router } from './router/index.js'
import './styles/main.css'

createApp(App).use(pinia).use(router).mount('#app')