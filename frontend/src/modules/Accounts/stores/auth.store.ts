import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, UserRole } from '../types/user.types'
import { AuthService } from '../services/auth.service'

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isAuthenticated = ref(false)
  const accessToken = ref<string | null>(null)
  const refreshToken = ref<string | null>(null)
  const tokenExpiresAt = ref<number | null>(null)
  const refreshTokenExpiresAt = ref<number | null>(null)
  const sessionTimeoutTimer = ref<number | null>(null)
  
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
  // Initialize auth from localStorage on app start
  function initializeAuth() {
    const storedUser = localStorage.getItem('user')
    const storedAccessToken = localStorage.getItem('accessToken')
    const storedRefreshToken = localStorage.getItem('refreshToken')
    const storedTokenExpiresAt = localStorage.getItem('tokenExpiresAt')
    const storedRefreshTokenExpiresAt = localStorage.getItem('refreshTokenExpiresAt')
    
    // TEMPORARY: For testing, create a mock logged-in user if no user exists
    if (!storedUser && !storedAccessToken) {
      console.log('🔧 Creating temporary mock user for testing')
      const mockUser: User = {
        id: 'test-user-123',
        email: 'test@example.com',
        fullName: 'Test User',
        role: 'INVESTOR',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      const mockToken = 'mock-access-token-123'
      const mockExpiry = Date.now() + 24 * 60 * 60 * 1000 // 24 hours from now
      
      localStorage.setItem('user', JSON.stringify(mockUser))
      localStorage.setItem('accessToken', mockToken)
      localStorage.setItem('tokenExpiresAt', mockExpiry.toString())
      
      user.value = mockUser
      accessToken.value = mockToken
      tokenExpiresAt.value = mockExpiry
      isAuthenticated.value = true
      
      console.log('🔧 Mock user created and logged in')
      return
    }
    
    if (storedUser) user.value = JSON.parse(storedUser)
    if (storedAccessToken) accessToken.value = storedAccessToken
    if (storedRefreshToken) refreshToken.value = storedRefreshToken
    if (storedTokenExpiresAt) tokenExpiresAt.value = parseInt(storedTokenExpiresAt)
    if (storedRefreshTokenExpiresAt) refreshTokenExpiresAt.value = parseInt(storedRefreshTokenExpiresAt)
    
    isAuthenticated.value = !!accessToken.value && !!user.value
    
    // Check if token is expired and needs refresh
    if (isAuthenticated.value && tokenExpiresAt.value && Date.now() >= tokenExpiresAt.value) {
      refreshAccessToken()
    }
    
    // Set up session timeout monitoring
    setupSessionTimeoutMonitoring()
  }
  
  // Password-based login removed - only OAuth authentication is supported
  async function login() {
    error.value = 'Direct login is not supported. Please use OAuth authentication.'
    throw new Error('Direct login is not supported. Please use OAuth authentication.')
  }
  
  // Password-based registration removed - only OAuth authentication is supported
  async function register() {
    error.value = 'Direct registration is not supported. Please use OAuth authentication.'
    throw new Error('Direct registration is not supported. Please use OAuth authentication.')
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
  
  // Password reset functions removed - only OAuth authentication is supported
  
  // Helper function to set auth data from login/register response
  function setAuthData(response: any) {
    user.value = response.user
    accessToken.value = response.accessToken
    refreshToken.value = response.refreshToken
    isAuthenticated.value = true
    
    // Parse JWT to get expiration times
    if (accessToken.value) {
      const tokenData = parseJwt(accessToken.value)
      if (tokenData && tokenData.exp) {
        tokenExpiresAt.value = tokenData.exp * 1000 // Convert to milliseconds
      }
    }
    
    if (refreshToken.value) {
      const refreshTokenData = parseJwt(refreshToken.value)
      if (refreshTokenData && refreshTokenData.exp) {
        refreshTokenExpiresAt.value = refreshTokenData.exp * 1000 // Convert to milliseconds
      }
    }
    
    // Store in localStorage
    localStorage.setItem('user', JSON.stringify(user.value))
    if (accessToken.value) localStorage.setItem('accessToken', accessToken.value)
    if (refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
    if (tokenExpiresAt.value) localStorage.setItem('tokenExpiresAt', tokenExpiresAt.value.toString())
    if (refreshTokenExpiresAt.value) localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt.value.toString())
    
    // Set up session timeout monitoring
    setupSessionTimeoutMonitoring()
  }
  
  // Helper function to clear auth data on logout
  function clearAuthData() {
    user.value = null
    accessToken.value = null
    refreshToken.value = null
    tokenExpiresAt.value = null
    refreshTokenExpiresAt.value = null
    isAuthenticated.value = false
    
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('tokenExpiresAt')
    localStorage.removeItem('refreshTokenExpiresAt')
    
    // Clear any session timeout timers
    if (sessionTimeoutTimer.value) {
      window.clearTimeout(sessionTimeoutTimer.value)
      sessionTimeoutTimer.value = null
    }
  }
  
  // Parse JWT token to get payload data
  function parseJwt(token: string) {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(c => {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
      }).join(''))
      return JSON.parse(jsonPayload)
    } catch (e) {
      console.error('Error parsing JWT:', e)
      return null
    }
  }
  
  // Refresh the access token using the refresh token
  async function refreshAccessToken() {
    if (!refreshToken.value) {
      clearAuthData()
      return false
    }
    
    try {
      const response = await AuthService.refreshToken(refreshToken.value)
      
      // Update tokens
      accessToken.value = response.accessToken
      if (response.refreshToken) {
        refreshToken.value = response.refreshToken
      }
      
      // Update expiration times
      if (accessToken.value) {
        const tokenData = parseJwt(accessToken.value)
        if (tokenData && tokenData.exp) {
          tokenExpiresAt.value = tokenData.exp * 1000
        }
      }
      
      if (response.refreshToken) {
        const refreshTokenData = parseJwt(response.refreshToken)
        if (refreshTokenData && refreshTokenData.exp) {
          refreshTokenExpiresAt.value = refreshTokenData.exp * 1000
        }
      }
      
      // Update localStorage
      if (accessToken.value) localStorage.setItem('accessToken', accessToken.value)
      if (response.refreshToken && refreshToken.value) localStorage.setItem('refreshToken', refreshToken.value)
      if (tokenExpiresAt.value) localStorage.setItem('tokenExpiresAt', tokenExpiresAt.value.toString())
      if (refreshTokenExpiresAt.value) localStorage.setItem('refreshTokenExpiresAt', refreshTokenExpiresAt.value.toString())
      
      isAuthenticated.value = true
      return true
    } catch (err) {
      console.error('Error refreshing token:', err)
      clearAuthData()
      return false
    }
  }
  
  // Set up monitoring for token expiration
  function setupSessionTimeoutMonitoring() {
    // Clear any existing timers
    if (sessionTimeoutTimer.value) {
      window.clearTimeout(sessionTimeoutTimer.value)
      sessionTimeoutTimer.value = null
    }
    
    // If we have a token expiration time, set up a timer to refresh before it expires
    if (tokenExpiresAt.value) {
      const currentTime = Date.now()
      const timeUntilExpiry = tokenExpiresAt.value - currentTime
      
      // If token is already expired, try to refresh immediately
      if (timeUntilExpiry <= 0) {
        refreshAccessToken()
        return
      }
      
      // Set timer to refresh 1 minute before expiry
      const refreshTime = Math.max(timeUntilExpiry - 60000, 0) // 1 minute before expiry, minimum 0
      sessionTimeoutTimer.value = window.setTimeout(() => {
        refreshAccessToken()
      }, refreshTime)
    }
  }
  
  // Check if the current token is valid or needs refresh
  function checkTokenValidity() {
    if (!accessToken.value || !tokenExpiresAt.value) {
      return false
    }
    
    const currentTime = Date.now()
    
    // If token is expired, try to refresh
    if (currentTime >= tokenExpiresAt.value) {
      return refreshAccessToken()
    }
    
    return true
  }
  
  // Initialize auth on store creation
  initializeAuth()
  
  return {
    // State
    user,
    loading,
    error,
    isAuthenticated,
    accessToken,
    refreshToken,
    tokenExpiresAt,
    
    // Getters
    fullName,
    isAdmin,
    isClient,
    isInvestor,
    userRole,
    
    // Actions
    login,
    register,
    logout,
    getCurrentUser,
    refreshAccessToken,
    checkTokenValidity,
    initializeAuth
  }
})