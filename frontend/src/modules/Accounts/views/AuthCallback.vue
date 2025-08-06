<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div class="text-center">
        <!-- OAuth Error Display -->
        <div v-if="error" class="flex flex-col items-center space-y-4">
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
        
        <!-- Fallback Loading State -->
        <div v-else class="flex flex-col items-center space-y-4">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <h2 class="text-xl font-semibold text-gray-900">
            Redirecting...
          </h2>
          <p class="text-gray-600">
            If you're not automatically redirected, <router-link to="/dashboard" class="text-blue-600 hover:text-blue-500">click here</router-link>.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()
const error = ref('')

onMounted(async () => {
  // Check for OAuth error in URL parameters
  const errorParam = route.query.error as string
  const errorDescription = route.query.error_description as string
  
  if (errorParam) {
    // Display OAuth error
    error.value = errorDescription || `OAuth error: ${errorParam}`
    console.error('❌ OAuth callback error:', errorParam, errorDescription)
    return
  }
  
  // No error - redirect to dashboard after short delay
  // (OAuth success should already redirect directly to dashboard, this is fallback)
  console.log('🔄 OAuth callback: No error detected, redirecting to dashboard...')
  setTimeout(() => {
    router.push('/dashboard')
  }, 2000)
})

function goToLogin() {
  router.push('/login')
}
</script>
