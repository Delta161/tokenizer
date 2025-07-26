import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import axios from 'axios'

import App from './App.vue'
import router from './router/index'

// Import module initializations
import { initAccountsModule } from './modules/Accounts'
import { initProjectsConsolidatedModule } from './modules/ProjectsConsolidated'

// Initialize the application
const app = createApp(App)

// Make axios available globally
app.config.globalProperties.$axios = axios

// Initialize Pinia store
app.use(createPinia())

// Initialize router
app.use(router)

// Initialize modules
initAccountsModule()
initProjectsConsolidatedModule()

// Mount the app
app.mount('#app')
