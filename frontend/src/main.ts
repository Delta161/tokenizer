import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router/index'

// Import module initializations
import { initAuthModule } from './modules/Auth'
import { initUserModule } from './modules/User'

// Initialize the application
const app = createApp(App)

// Make axios available globally
app.config.globalProperties.$axios = axios

// Initialize Pinia store
app.use(createPinia())

// Initialize router
app.use(router)

// Initialize modules
initAuthModule()
initUserModule()

// Mount the app
app.mount('#app')
