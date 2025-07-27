/**
 * Auth Routes
 * 
 * This file defines the routes for authentication in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Import the merged AuthView component
import { AuthView } from '../components';

// Legacy components - kept for backward compatibility but not used in routes
const LoginView = defineAsyncComponent(() => import('./LoginView.vue'));
// RegisterView removed - only OAuth authentication is supported
// ForgotPasswordView removed - only OAuth authentication is supported

export const authRoutes: RouteRecordRaw[] = [
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
  }
  // forgot-password route removed - only OAuth authentication is supported
];