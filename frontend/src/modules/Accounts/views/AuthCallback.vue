<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <div v-if="loading" class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 class="text-xl font-semibold text-gray-900">
            Completing your login...
          </h2>
          <p class="text-gray-600">
            Please wait while we finish setting up your account.
          </p>
        </div>
        
        <div v-else-if="error" class="flex flex-col items-center space-y-4">
          <div class="rounded-full bg-red-100 p-3">
            <svg class="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-red-900">
            Authentication Failed
          </h2>
          <p class="text-red-600 text-center">
            {{ error }}
          </p>
          <button 
            @click="goToLogin"
            class="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Try Again
          </button>
        </div>
        
        <div v-else class="flex flex-col items-center space-y-4">
          <div class="rounded-full bg-green-100 p-3">
            <svg class="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 class="text-xl font-semibold text-green-900">
            Login Successful!
          </h2>
          <p class="text-green-600">
            Redirecting you to the dashboard...
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/Accounts/stores/auth.store'

const router = useRouter()
const authStore = useAuthStore()

const loading = ref(true)
const error = ref('')

onMounted(async () => {
  try {
    // Handle OAuth callback by fetching user profile
    await authStore.handleOAuthCallback()
    
    // Success! Redirect to dashboard
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
    
  } catch (err: any) {
    console.error('OAuth callback error:', err)
    error.value = err.message || 'Failed to complete login. Please try again.'
  } finally {
    loading.value = false
  }
})

function goToLogin() {
  router.push('/login')
}
</script>
