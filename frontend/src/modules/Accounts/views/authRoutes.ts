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
const ForgotPasswordView = defineAsyncComponent(() => import('./ForgotPasswordView.vue'));
const ResetPasswordView = defineAsyncComponent(() => import('./ResetPasswordView.vue'));

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
  },
  {
    path: '/forgot-password',
    name: 'forgot-password',
    component: ForgotPasswordView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  },
  {
    path: '/reset-password/:token',
    name: 'reset-password',
    component: ResetPasswordView,
    meta: {
      requiresAuth: false,
      layout: 'AuthLayout'
    }
  }
];