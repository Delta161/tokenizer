import { createRouter, createWebHistory } from 'vue-router';
import { authRoutes } from '@/modules/Auth/views';
// import { useAuthStore } from '@/stores/auth'; // Commented out for disabling auth
 
 const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/project/:id',
      name: 'project-detail',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('@/views/Home.vue')
    },
    {
      path: '/add-project',
      name: 'add-project',
      component: () => import('@/components/AddProjectForm.vue')
    },
    // Add auth routes from Auth module
    ...authRoutes,
    // {
    //   path: '/kyc',
    //   name: 'kyc',
    //   component: () => import('@/views/Kyc.vue'),
    //   meta: { requiresAuth: true }
    // },
    // {
    //   path: '/admin',
    //   name: 'admin',
    //   component: () => import('@/views/AdminPanel.vue'),
    //   meta: { requiresAuth: true, requiresAdmin: true }
    // }
  ]
});
// router.beforeEach((to, from, next) => {
//   const authStore = useAuthStore();
//   if (to.meta.requiresAuth && !authStore.isAuthenticated) {
//     next('/login');
//   } else if (to.meta.requiresAdmin && (!authStore.user || !authStore.user.isAdmin)) {
//     next('/dashboard'); // or wherever non-admins should go
//   } else {
//     next();
//   }
// }); // Commented out for disabling auth
 
 export default router;
