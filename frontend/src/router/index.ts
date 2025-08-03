import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/Accounts'
import { authRoutes } from '../modules/Accounts/views/authRoutes'
import { kycRoutes } from '../modules/Accounts/views/kycRoutes'
import { exampleRoutes } from '../modules/Accounts/examples/exampleRoutes'
import UserProfileView from '@/modules/Accounts/views/UserProfile.view.vue';

// Import module routes - lazy import to avoid circular dependencies
import { projectRoutes } from '../modules/Projects'

// Import layouts
const DefaultLayout = () => import('../layouts/DefaultLayout.vue')
const AuthLayout = () => import('../layouts/AuthLayout.vue')

// Import views
const HomeView = () => import('../views/Home.vue')
const FrontPageView = () => import('../views/FrontPage.vue')
const DashboardView = () => import('../views/Home.vue') // Using Home.vue as fallback
const NotFoundView = () => import('../views/Home.vue') // Using Home.vue as fallback

// Create router instance
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Front page route
    {
      path: '/',
      name: 'front-page',
      component: FrontPageView,
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    // Home route
    {
      path: '/home',
      name: 'home',
      component: HomeView,
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
//Profile Router
    {
      path: '/profile',
      name: 'profile',
      component: UserProfileView,
      meta: { requiresAuth: true }
    },
    
    // Dashboard route
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView,
      meta: {
        requiresAuth: true,
        layout: 'DefaultLayout'
      }
    },
    
    // Projects routes
    ...projectRoutes.map(route => ({
      ...route,
      meta: {
        ...route.meta,
        layout: 'DefaultLayout'
      }
    })),
    
    // Properties routes
    {
      path: '/properties',
      name: 'properties',
      component: () => import('@/views/PropertiesView.vue'),
      meta: {
        requiresAuth: false,
        layout: 'PropertiesLayout'
      }
    },
    {
      path: '/properties-list',
      name: 'properties-list',
      component: () => import('@/views/PropertiesListView.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/property/:id',
      name: 'property-detail',
      component: () => import('@/views/PropertyDetailView.vue'),
      meta: {
        requiresAuth: false,
        layout: 'PropertiesLayout'
      }
    },
    
    // Demo routes
    {
      path: '/sections-demo',
      name: 'sections-demo',
      component: () => import('@/views/DemoPage.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/error-handling-demo',
      name: 'error-handling-demo',
      component: () => import('@/examples/ErrorHandlingExample.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/button-demo',
      name: 'button-demo',
      component: () => import('@/views/ButtonDemo.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    
    // Login and callback routes
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue'),
      meta: {
        requiresAuth: false,
        layout: 'AuthLayout'
      }
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('@/views/CallbackPage.vue'),
      meta: {
        requiresAuth: false,
        layout: 'AuthLayout'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: {
        requiresAuth: true,
        layout: 'DefaultLayout'
      }
    },
    
    // Accounts module routes (consolidated Auth, User, and KYC routes)
    ...authRoutes,
    ...kycRoutes,
    
    // Example routes for component demonstrations
    ...exampleRoutes,
    
    // 404 route
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: NotFoundView,
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    }
  ]
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
  console.log('🔍 Router guard - navigating to:', to.path)
  
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  console.log('🔍 Route requires auth:', requiresAuth)
  
  // Get auth store
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  let isAuthenticated = authStore.isAuthenticated
  console.log('🔍 Initial isAuthenticated:', isAuthenticated)
  console.log('🔍 Access token exists:', !!localStorage.getItem('accessToken'))
  console.log('🔍 User in store:', !!authStore.user)
  
  // If not authenticated but has tokens in localStorage, try to validate them
  if (!isAuthenticated && (localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'))) {
    console.log('🔍 Tokens found in localStorage, trying to validate...')
    try {
      // Initialize auth from localStorage and check token validity
      authStore.initializeAuth()
      const isValid = await authStore.checkTokenValidity()
      isAuthenticated = authStore.isAuthenticated && isValid
      console.log('🔍 After validation - isAuthenticated:', isAuthenticated, 'isValid:', isValid)
    } catch (error) {
      console.log('🔍 Token validation failed:', error)
      // Tokens are invalid, clear them
      authStore.logout()
    }
  }
  
  // Check if route requires specific role
  const requiresRole = to.matched.some(record => record.meta.requiresRole) 
    ? to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole 
    : null
  
  // Handle authentication and role requirements
  console.log('🔍 Final check - requiresAuth:', requiresAuth, 'isAuthenticated:', isAuthenticated)
  if (requiresAuth && !isAuthenticated) {
    console.log('🔍 Redirecting to login page')
    // Redirect to login if authentication is required but user is not authenticated
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresRole && isAuthenticated) {
    // Check if user has required role
    const hasRequiredRole = Array.isArray(requiresRole) 
      ? requiresRole.includes(authStore.userRole)
      : authStore.userRole === requiresRole
    
    if (!hasRequiredRole) {
      // Redirect to dashboard if user doesn't have required role
      next({ name: 'dashboard' })
    } else {
      next()
    }
  } else {
    console.log('🔍 Navigation allowed - continuing to:', to.path)
    // Continue navigation
    next()
  }
})

// Layout handling
router.beforeResolve((to, from, next) => {
  // Get layout from route meta
  const layout = to.meta.layout || 'DefaultLayout'
  
  // Set layout component
  let layoutComponent
  switch (layout) {
    case 'AuthLayout':
      layoutComponent = AuthLayout
      break
    case 'PropertiesLayout':
      layoutComponent = () => import('../layouts/PropertiesLayout.vue')
      break
    case 'DefaultLayout':
    default:
      layoutComponent = DefaultLayout
      break
  }
  
  // Set layout component on route meta
  to.meta.layoutComponent = layoutComponent
  
  next()
})

export default router
