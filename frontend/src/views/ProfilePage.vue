<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-20">
        <div class="text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto"></div>
          <p class="mt-4 text-gray-600 font-medium">Loading your profile...</p>
        </div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="max-w-md mx-auto">
        <div class="bg-white rounded-lg shadow-lg border border-red-200 overflow-hidden">
          <div class="bg-red-50 px-6 py-4 border-b border-red-200">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <svg class="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 class="ml-3 text-lg font-medium text-red-800">Unable to Load Profile</h3>
            </div>
          </div>
          <div class="px-6 py-4">
            <p class="text-red-700 mb-4">{{ error }}</p>
            <button 
              @click="loadProfileData" 
              class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>

      <!-- Profile Content -->
      <div v-else-if="user" class="space-y-6">
        <!-- Profile Header Card -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="relative">
            <!-- Cover Background -->
            <div class="h-32 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800"></div>
            <div class="absolute inset-0 bg-black opacity-10"></div>
            
            <!-- Profile Info -->
            <div class="relative px-6 pb-6">
              <div class="flex items-end -mt-12 mb-4">
                <!-- Avatar -->
                <div class="relative">
                  <img 
                    v-if="user.avatarUrl" 
                    :src="user.avatarUrl" 
                    :alt="user.fullName || 'User Avatar'"
                    class="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white"
                  >
                  <div 
                    v-else 
                    class="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center"
                  >
                    <span class="text-2xl font-bold text-white">
                      {{ getUserInitials() }}
                    </span>
                  </div>
                  <!-- Online Status Indicator -->
                  <div class="absolute -bottom-1 -right-1 w-6 h-6 bg-green-400 border-2 border-white rounded-full"></div>
                </div>
                
                <!-- Quick Actions -->
                <div class="ml-auto flex space-x-3">
                  <button 
                    @click="loadProfileData"
                    class="inline-flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                    </svg>
                    Refresh
                  </button>
                  <button 
                    @click="logout" 
                    class="inline-flex items-center px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-medium rounded-lg transition-colors duration-200"
                  >
                    <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path>
                    </svg>
                    Sign Out
                  </button>
                </div>
              </div>
              
              <!-- User Basic Info -->
              <div>
                <h1 class="text-2xl font-bold text-gray-900 mb-1">
                  {{ user.fullName || 'Welcome User' }}
                </h1>
                <p class="text-gray-600 mb-3">{{ user.email }}</p>
                <div class="flex items-center space-x-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                    </svg>
                    {{ formatRole(user.role) }}
                  </span>
                  <span v-if="user.authProvider" class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    {{ formatProvider(user.authProvider) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Profile Details Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- Account Information -->
          <div class="lg:col-span-2">
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-6">
                <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h2 class="ml-3 text-lg font-semibold text-gray-900">Account Information</h2>
              </div>
              
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-500">Email Address</label>
                  <p class="text-gray-900 font-medium">{{ user.email }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-500">Full Name</label>
                  <p class="text-gray-900 font-medium">{{ user.fullName || 'Not provided' }}</p>
                </div>
                <div class="space-y-1">
                  <label class="text-sm font-medium text-gray-500">Account Role</label>
                  <p class="text-gray-900 font-medium">{{ formatRole(user.role) }}</p>
                </div>
                <div v-if="user.authProvider" class="space-y-1">
                  <label class="text-sm font-medium text-gray-500">Sign-in Method</label>
                  <p class="text-gray-900 font-medium">{{ formatProvider(user.authProvider) }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Account Activity -->
          <div class="space-y-6">
            <!-- Activity Card -->
            <div class="bg-white rounded-xl shadow-lg p-6">
              <div class="flex items-center mb-4">
                <div class="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
                  </svg>
                </div>
                <h3 class="ml-3 font-semibold text-gray-900">Activity</h3>
              </div>
              
              <div class="space-y-3">
                <div v-if="user.createdAt" class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-500">Member since</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDateShort(user.createdAt) }}</span>
                </div>
                <div v-if="user.lastLoginAt" class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-500">Last login</span>
                  <span class="text-sm font-medium text-gray-900">{{ formatDateShort(user.lastLoginAt) }}</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-sm text-gray-500">Account status</span>
                  <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <span class="w-1.5 h-1.5 bg-green-400 rounded-full mr-1.5"></span>
                    Active
                  </span>
                </div>
              </div>
            </div>

            <!-- Quick Stats Card -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-6 border border-blue-200">
              <div class="text-center">
                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                  </svg>
                </div>
                <h4 class="text-lg font-semibold text-gray-900 mb-1">Welcome Back!</h4>
                <p class="text-sm text-gray-600">Everything looks great with your account</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No User State -->
      <div v-else class="max-w-md mx-auto text-center py-20">
        <div class="bg-white rounded-xl shadow-lg p-8">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
            </svg>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No Profile Available</h3>
          <p class="text-gray-600 mb-6">We couldn't load your profile information.</p>
          <button 
            @click="loadProfileData"
            class="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Load Profile
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/modules/Accounts/stores/auth.store'
import { useUserStore } from '@/modules/Accounts/stores/user.store'

// Router and stores
const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()

// State
const loading = ref(false)
const error = ref<string | null>(null)

// Computed
const user = computed(() => {
  // Try multiple sources for user data
  return userStore.currentUser || authStore.user
})

// Methods
const loadProfileData = async () => {
  try {
    console.log('🔄 Loading profile data...')
    loading.value = true
    error.value = null
    
    // First check if user is authenticated
    const isAuth = await authStore.checkAuth()
    console.log('🔐 Auth check result:', isAuth)
    
    if (isAuth && authStore.user) {
      console.log('✅ User from auth store:', authStore.user)
      return
    }
    
    // Try to get user from user store
    if (userStore.fetchCurrentUser) {
      await userStore.fetchCurrentUser()
      console.log('📊 User store result:', userStore.currentUser)
    }
    
  } catch (err) {
    console.error('❌ Failed to load profile:', err)
    error.value = err instanceof Error ? err.message : 'Failed to load profile'
  } finally {
    loading.value = false
  }
}

const getUserInitials = (): string => {
  const name = user.value?.fullName || user.value?.email || 'U'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatRole = (role: string): string => {
  if (!role) return 'User'
  return role.charAt(0).toUpperCase() + role.slice(1).toLowerCase()
}

const formatProvider = (provider: string): string => {
  if (!provider) return 'Unknown'
  switch (provider.toLowerCase()) {
    case 'google': return 'Google'
    case 'microsoft': return 'Microsoft'
    case 'apple': return 'Apple'
    case 'local': return 'Email & Password'
    default: return provider.charAt(0).toUpperCase() + provider.slice(1)
  }
}

const formatDateShort = (date: string | Date): string => {
  if (!date) return 'Unknown'
  try {
    const d = new Date(date)
    return d.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    })
  } catch {
    return 'Invalid date'
  }
}

const logout = async (): Promise<void> => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    router.push('/login')
  }
}

// Load data on mount
onMounted(() => {
  console.log('🎯 Profile page mounted')
  loadProfileData()
})
</script>