import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginPage.vue')
    },
    {
      path: '/callback',
      name: 'callback',
      component: () => import('@/views/CallbackPage.vue')
    },
    {
      path: '/profile',
      name: 'profile',
      component: () => import('@/views/ProfilePage.vue'),
      meta: { requiresAuth: true }
    }
  ]
});

// Navigation guard to check authentication for protected routes
router.beforeEach((to, from, next) => {
  // Check if the route requires authentication
  if (to.meta.requiresAuth) {
    // Check if user is authenticated (has token)
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token && !user) {
      // Not authenticated, redirect to login
      next('/login');
      return;
    }
  }
  
  // Continue navigation
  next();
});

export default router;