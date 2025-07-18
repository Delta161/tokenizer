import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import module initializations
import { initAuthModule } from './modules/Auth'
import { initUserModule } from './modules/User'

// Initialize modules
initAuthModule()
initUserModule()

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
