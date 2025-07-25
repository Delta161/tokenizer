<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import { useAuthStore } from './modules/Auth/store/authStore'
import ErrorBanner from './components/ErrorBanner.vue'
import NotificationContainer from './components/NotificationContainer.vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import AuthLayout from './layouts/AuthLayout.vue'

// Get route and auth store
const route = useRoute()
const authStore = useAuthStore()

// Get layout component from route meta
const layoutComponent = computed(() => {
  if (route.meta.layout === 'DefaultLayout') {
    return DefaultLayout
  } else if (route.meta.layout === 'AuthLayout') {
    return AuthLayout
  }
  return null
})

// Check authentication on app mount
onMounted(async () => {
  if (localStorage.getItem('accessToken') || localStorage.getItem('refreshToken')) {
    try {
      // Initialize auth from localStorage and check token validity
      authStore.initializeAuth()
      await authStore.checkTokenValidity()
    } catch (error) {
      // Ignore errors, will be handled by router guard
    }
  }
})
</script>

<template>
  <!-- Global error banner for critical errors -->
  <ErrorBanner />
  
  <!-- Main content -->
  <component :is="layoutComponent" v-if="layoutComponent">
    <router-view />
  </component>
  <router-view v-else />
  
  <!-- Notification container for toast messages -->
  <NotificationContainer />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  line-height: 1.6;
  color: #333;
}

#app {
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
</style>
