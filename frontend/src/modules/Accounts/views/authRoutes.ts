/**
 * Auth Routes
 * 
 * This file defines the routes for authentication in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Lazy-loaded components
const LoginView = defineAsyncComponent(() => import('./LoginView.vue'));
const RegisterView = defineAsyncComponent(() => import('./RegisterView.vue'));
// ForgotPasswordView removed - only OAuth authentication is supported

export const authRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  }
  // forgot-password route removed - only OAuth authentication is supported
];