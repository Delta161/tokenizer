import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../modules/Accounts'
import { accountsRoutes } from '../modules/Accounts/routes'
import { exampleRoutes } from '../modules/Accounts/examples/exampleRoutes'

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
      path: '/navbar-auth-summary',
      name: 'navbar-auth-summary',
      component: () => import('@/components/NavBarAuthSummary.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/auth-test',
      name: 'auth-test',
      component: () => import('@/components/AuthTest.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/refactoring-summary',
      name: 'refactoring-summary',
      component: () => import('@/components/RefactoringSummary.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/test-api-services',
      name: 'test-api-services',
      component: () => import('@/components/TestAPIServices.vue'),
      meta: {
        requiresAuth: false,
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/test-user-profile',
      name: 'test-user-profile',
      component: () => import('@/components/TestUserProfile.vue'),
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
    
    // Login and callback routes - using consolidated auth.view.vue
    {
      path: '/login',
      name: 'login',
      component: () => import('@/modules/Accounts/views/auth.view.vue'),
      meta: {
        requiresAuth: false,
        layout: 'AuthLayout'
      }
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('@/modules/Accounts/views/AuthCallback.vue'),
      meta: {
        requiresAuth: false,
        layout: 'AuthLayout'
      }
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('@/modules/Accounts/views/AuthCallback.vue'),
      meta: {
        requiresAuth: false,
        layout: 'AuthLayout'
      }
    },
    {
      path: '/user',
      name: 'user',
      component: () => import('@/views/ProfilePage.vue'),
      meta: {
        requiresAuth: false, // Temporarily disabled for testing
        layout: 'DefaultLayout'
      }
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: {
        requiresAuth: false, // Temporarily disabled for testing
        layout: 'DefaultLayout'
      }
    },
    
    // Accounts module routes (consolidated Auth, User, and KYC routes)
    ...accountsRoutes,
    
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
  
  // If route doesn't require auth, allow navigation
  if (!requiresAuth) {
    console.log('🔍 Route does not require auth, proceeding')
    next()
    return
  }
  
  // Get auth store
  const authStore = useAuthStore()
  
  // Check if user is authenticated
  let isAuthenticated = authStore.isAuthenticated
  console.log('🔍 Initial isAuthenticated:', isAuthenticated)
  console.log('🔍 User in store:', !!authStore.user)
  
  // Only check auth if not already authenticated
  if (!isAuthenticated) {
    console.log('🔍 Not authenticated, checking session...')
    try {
      // Check session-based authentication (now with caching)
      isAuthenticated = await authStore.checkAuth()
      console.log('🔍 After session check - isAuthenticated:', isAuthenticated)
    } catch (error) {
      console.log('🔍 Session check failed:', error)
      // Session is invalid, clear any cached data
      authStore.clearAuthData()
    }
  } else {
    console.log('🔍 Already authenticated, skipping auth check')
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
