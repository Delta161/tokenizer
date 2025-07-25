import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginCredentials, RegisterData, PasswordResetRequest, PasswordResetConfirm } from '../types'
import { authService } from '../services'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const token = ref<string | null>(null)
  
  // Getters
  const fullName = computed(() => {
    if (!user.value) return ''
    return `${user.value.firstName} ${user.value.lastName}`.trim()
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
  
  // Actions
  async function login(credentials: LoginCredentials) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.login(credentials)
      user.value = response.user
      token.value = response.token
      isAuthenticated.value = true
      return response
    } catch (err: any) {
      console.error('Error in login:', err)
      error.value = err.message || 'Failed to login. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function register(data: RegisterData) {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.register(data)
      user.value = response.user
      token.value = response.token
      isAuthenticated.value = true
      return response
    } catch (err: any) {
      console.error('Error in register:', err)
      error.value = err.message || 'Failed to register. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function logout() {
    loading.value = true
    error.value = null
    
    try {
      await authService.logout()
      user.value = null
      token.value = null
      isAuthenticated.value = false
    } catch (err: any) {
      console.error('Error in logout:', err)
      error.value = err.message || 'Failed to logout. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function getCurrentUser() {
    loading.value = true
    error.value = null
    
    try {
      const response = await authService.getCurrentUser()
      user.value = response.user
      token.value = response.token
      isAuthenticated.value = true
      return response
    } catch (err: any) {
      console.error('Error in getCurrentUser:', err)
      error.value = err.message || 'Failed to get current user.'
      user.value = null
      token.value = null
      isAuthenticated.value = false
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function requestPasswordReset(data: PasswordResetRequest) {
    loading.value = true
    error.value = null
    
    try {
      await authService.requestPasswordReset(data)
    } catch (err: any) {
      console.error('Error in requestPasswordReset:', err)
      error.value = err.message || 'Failed to request password reset. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  async function confirmPasswordReset(data: PasswordResetConfirm) {
    loading.value = true
    error.value = null
    
    try {
      await authService.confirmPasswordReset(data)
    } catch (err: any) {
      console.error('Error in confirmPasswordReset:', err)
      error.value = err.message || 'Failed to confirm password reset. Please try again.'
      throw err
    } finally {
      loading.value = false
    }
  }
  
  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    token,
    
    // Getters
    fullName,
    isAdmin,
    isClient,
    isInvestor,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    requestPasswordReset,
    confirmPasswordReset
  }
})