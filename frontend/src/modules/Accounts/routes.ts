/**
 * Accounts Module Routes
 * 
 * This file defines all routes for the Accounts module using the clean 3-view architecture:
 * - auth.view.vue: Authentication flows
 * - user.view.vue: User management, profiles, lists, settings
 * - kyc.view.vue: KYC verification and callback handling
 */

import type { RouteRecordRaw } from 'vue-router';

// Lazy-loaded view components
const AuthView = () => import('./views/auth.view.vue');
const UserView = () => import('./views/user.view.vue');
const KycView = () => import('./views/kyc.view.vue');

export const accountsRoutes: RouteRecordRaw[] = [
  // Authentication routes
  {
    path: '/login',
    name: 'login',
    component: AuthView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: AuthView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },

  // User management routes (all handled by user.view.vue)
  {
    path: '/account/profile',
    name: 'user-profile',
    component: UserView,
    meta: {
      requiresAuth: true,
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/account/settings',
    name: 'user-settings',
    component: UserView,
    meta: {
      requiresAuth: true,
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/account/users',
    name: 'user-list',
    component: UserView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/account/users/:id',
    name: 'user-detail',
    component: UserView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      layout: 'DashboardLayout'
    }
  },

  // KYC verification routes (all handled by kyc.view.vue)
  {
    path: '/account/kyc',
    name: 'kyc-verification',
    component: KycView,
    meta: {
      requiresAuth: true,
      layout: 'DashboardLayout'
    }
  },
  {
    path: '/account/kyc/callback',
    name: 'kyc-callback',
    component: KycView,
    meta: {
      requiresAuth: true,
      layout: 'DashboardLayout'
    }
  }
];

// Legacy export for backward compatibility
export const authRoutes = accountsRoutes;