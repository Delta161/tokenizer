import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Create Vue app
const app = createApp(App)

// Make axios available globally
app.config.globalProperties.$axios = axios

// Use router
app.use(router)

// Mount app
app.mount('#app')