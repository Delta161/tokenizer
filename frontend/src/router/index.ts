import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/Auth/store/authStore'

// Import module routes
import { authRoutes } from '../modules/Auth/views'
import { userRoutes } from '../modules/User/views'

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
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/Home.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@/views/Home.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/add-project',
      name: 'add-project',
      component: () => import('@/components/AddProjectForm.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
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
    
    // Auth module routes
    ...authRoutes,
    
    // User module routes
    ...userRoutes,
    
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
  // Check if route requires authentication
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
  
  // Get auth store
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  let isAuthenticated = authStore.isAuthenticated
  
  // If not authenticated but has tokens in localStorage, try to validate them
  if (!isAuthenticated && (localStorage.getItem('accessToken') || localStorage.getItem('refreshToken'))) {
    try {
      // Initialize auth from localStorage and check token validity
      authStore.initializeAuth()
      const isValid = await authStore.checkTokenValidity()
      isAuthenticated = authStore.isAuthenticated && isValid
    } catch (error) {
      // Tokens are invalid, clear them
      authStore.logout()
    }
  }
  
  // Check if route requires specific role
  const requiresRole = to.matched.some(record => record.meta.requiresRole) 
    ? to.matched.find(record => record.meta.requiresRole)?.meta.requiresRole 
    : null
  
  // Handle authentication and role requirements
  if (requiresAuth && !isAuthenticated) {
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
