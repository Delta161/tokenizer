import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '../types/user.types'
import { AuthService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State - Simplified for session-based auth
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = ref(false)
  
  // Cache for auth checks to prevent excessive API calls
  const lastAuthCheck = ref<number>(0)
  const AUTH_CACHE_DURATION = 30000 // 30 seconds cache
  
  // Getters
  const fullName = computed(() => {
    if (!user.value) return ''
    return user.value.fullName || ''
  })
  
  const isAdmin = computed(() => {
    return user.value?.role === 'ADMIN'
  })
  
  const isClient = computed(() => {
    return user.value?.role === 'CLIENT'
  })
  
  const isInvestor = computed(() => {
    return user.value?.role === 'INVESTOR'
  })

  const userRole = computed(() => {
    return user.value?.role || 'INVESTOR'
  })
  
  // Actions
  // Initialize auth by checking session status
  async function initializeAuth() {
    loading.value = true
    error.value = null
    
    try {
      const result = await AuthService.checkAuth()
      if (result.isAuthenticated && result.user) {
        user.value = result.user
        isAuthenticated.value = true
        // Store user data in localStorage for UI purposes only
        localStorage.setItem('user', JSON.stringify(result.user))
      } else {
        clearAuthData()
      }
    } catch (err) {
      console.error('Error initializing auth:', err)
      clearAuthData()
    } finally {
      loading.value = false
    }
  }
  
  // OAuth login - redirects to provider
  function loginWithGoogle() {
    window.location.href = AuthService.getGoogleLoginUrl()
  }
  
  function loginWithAzure() {
    window.location.href = AuthService.getAzureLoginUrl()
  }
  
  function loginWithApple() {
    window.location.href = AuthService.getAppleLoginUrl()
  }
  
  async function logout() {
    loading.value = true
    error.value = null
    
    try {
      await AuthService.logout()
      clearAuthData()
    } catch (err: any) {
      console.error('Error in logout:', err)
      error.value = err.message || 'Failed to logout. Please try again.'
      // Even if the API call fails, clear local auth data
      clearAuthData()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function getCurrentUser() {
    loading.value = true
    error.value = null
    
    try {
      const response = await AuthService.getCurrentUser()
      user.value = response
      isAuthenticated.value = true
      // Store user data in localStorage for UI purposes only
      localStorage.setItem('user', JSON.stringify(response))
      return response
    } catch (err: any) {
      console.error('Error in getCurrentUser:', err)
      error.value = err.message || 'Failed to get current user.'
      clearAuthData()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Handle OAuth callback - called after successful OAuth redirect
  async function handleOAuthCallback() {
    loading.value = true
    error.value = null
    
    try {
      // After OAuth redirect, the backend has set session cookies
      // We just need to fetch the user profile
      const userData = await AuthService.getCurrentUser()
      user.value = userData
      isAuthenticated.value = true
      // Store user data in localStorage for UI purposes only
      localStorage.setItem('user', JSON.stringify(userData))
      return userData
    } catch (err: any) {
      console.error('Error handling OAuth callback:', err)
      error.value = err.message || 'Failed to complete authentication.'
      clearAuthData()
      throw err
    } finally {
      loading.value = false
    }
  }
  
  // Helper function to clear auth data on logout
  function clearAuthData() {
    user.value = null
    isAuthenticated.value = false
    lastAuthCheck.value = 0 // Clear auth check cache
    
    // Clear localStorage (user data only - no tokens in session-based auth)
    localStorage.removeItem('user')
  }
  
  // Check if user is authenticated (useful for navigation guards)
  // Uses caching to prevent excessive API calls
  async function checkAuth() {
    const now = Date.now()
    
    // Return cached result if within cache duration and we already have auth state
    if (isAuthenticated.value && user.value && (now - lastAuthCheck.value) < AUTH_CACHE_DURATION) {
      console.log('🔍 Using cached auth state')
      return true
    }
    
    // If not authenticated but recently checked, skip API call
    if (!isAuthenticated.value && (now - lastAuthCheck.value) < AUTH_CACHE_DURATION) {
      console.log('🔍 Recently checked - user not authenticated')
      return false
    }
    
    try {
      console.log('🔍 Making fresh auth check API call')
      const result = await AuthService.checkAuth()
      lastAuthCheck.value = now
      
      if (result.isAuthenticated && result.user) {
        user.value = result.user
        isAuthenticated.value = true
        localStorage.setItem('user', JSON.stringify(result.user))
        return true
      } else {
        clearAuthData()
        return false
      }
    } catch (err) {
      console.error('Error checking auth:', err)
      lastAuthCheck.value = now
      clearAuthData()
      return false
    }
  }
  
  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    
    // Getters
    fullName,
    isAdmin,
    isClient,
    isInvestor,
    userRole,
    
    // Actions
    loginWithGoogle,
    loginWithAzure,
    loginWithApple,
    logout,
    getCurrentUser,
    handleOAuthCallback,
    checkAuth,
    initializeAuth,
    clearAuthData
  }
})