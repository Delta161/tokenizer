<template>
  <div class="p-8 max-w-4xl mx-auto">
    <h1 class="text-3xl font-bold mb-8">Authentication Status Test</h1>
    
    <!-- Current Auth State -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Current Authentication State</h2>
      
      <div class="grid md:grid-cols-2 gap-4">
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Authentication Status</h3>
          <p class="text-lg">
            <span 
              class="px-3 py-1 rounded-full text-sm font-medium"
              :class="authStore.isAuthenticated ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'"
            >
              {{ authStore.isAuthenticated ? 'Authenticated' : 'Not Authenticated' }}
            </span>
          </p>
        </div>
        
        <div>
          <h3 class="font-medium text-gray-700 mb-2">Access Token</h3>
          <p class="text-sm text-gray-600 font-mono">
            {{ authStore.accessToken ? `${authStore.accessToken.substring(0, 20)}...` : 'No token' }}
          </p>
        </div>
      </div>
      
      <div class="mt-4" v-if="authStore.user">
        <h3 class="font-medium text-gray-700 mb-2">User Information</h3>
        <div class="bg-gray-50 rounded-md p-3">
          <p><strong>Name:</strong> {{ authStore.user.fullName }}</p>
          <p><strong>Email:</strong> {{ authStore.user.email }}</p>
          <p><strong>Role:</strong> {{ authStore.user.role }}</p>
          <p><strong>ID:</strong> {{ authStore.user.id }}</p>
        </div>
      </div>
    </div>
    
    <!-- Test Controls -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibent mb-4">Test Controls</h2>
      
      <div class="flex space-x-4">
        <button 
          @click="testSignOut"
          :disabled="!authStore.isAuthenticated || loading"
          class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {{ loading ? 'Signing Out...' : 'Test Sign Out' }}
        </button>
        
        <button 
          @click="reinitializeAuth"
          class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Reinitialize Auth (Creates Mock User)
        </button>
        
        <button 
          @click="clearAllAuth"
          class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
        >
          Clear All Auth Data
        </button>
      </div>
    </div>
    
    <!-- NavBar Preview -->
    <div class="bg-white shadow-md rounded-lg p-6">
      <h2 class="text-xl font-semibold mb-4">NavBar Button Preview</h2>
      <p class="text-gray-600 mb-4">This shows what the NavBar button should display:</p>
      
      <button 
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        @click="handleNavBarAction"
      >
        {{ authStore.isAuthenticated ? 'Sign Out' : 'Sign In' }}
      </button>
      
      <p class="text-sm text-gray-500 mt-2">
        Current state: {{ authStore.isAuthenticated ? 'Authenticated (should show Sign Out)' : 'Not Authenticated (should show Sign In)' }}
      </p>
    </div>
    
    <!-- Action Log -->
    <div v-if="actionLog.length > 0" class="bg-white shadow-md rounded-lg p-6 mt-6">
      <h2 class="text-xl font-semibold mb-4">Action Log</h2>
      <div class="space-y-2">
        <div 
          v-for="(log, index) in actionLog" 
          :key="index"
          class="text-sm p-2 rounded"
          :class="{
            'bg-green-50 text-green-700': log.type === 'success',
            'bg-red-50 text-red-700': log.type === 'error',
            'bg-blue-50 text-blue-700': log.type === 'info'
          }"
        >
          <span class="font-medium">{{ new Date(log.timestamp).toLocaleTimeString() }}:</span>
          {{ log.message }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '../modules/Accounts/stores/auth.store'

const authStore = useAuthStore()
const loading = ref(false)
const actionLog = ref<Array<{ type: 'success' | 'error' | 'info', message: string, timestamp: number }>>([])

const logAction = (type: 'success' | 'error' | 'info', message: string) => {
  actionLog.value.unshift({ type, message, timestamp: Date.now() })
  if (actionLog.value.length > 10) {
    actionLog.value = actionLog.value.slice(0, 10)
  }
}

const testSignOut = async () => {
  loading.value = true
  try {
    await authStore.logout()
    logAction('success', 'Successfully signed out')
  } catch (error: any) {
    logAction('error', `Sign out failed: ${error.message}`)
  } finally {
    loading.value = false
  }
}

const reinitializeAuth = () => {
  authStore.initializeAuth()
  logAction('info', 'Auth reinitialized - mock user should be created if no existing auth')
}

const clearAllAuth = () => {
  localStorage.clear()
  // Force a page reload to clear the store state
  window.location.reload()
}

const handleNavBarAction = async () => {
  if (authStore.isAuthenticated) {
    await testSignOut()
  } else {
    logAction('info', 'Would navigate to sign in page (/login)')
  }
}
</script>
