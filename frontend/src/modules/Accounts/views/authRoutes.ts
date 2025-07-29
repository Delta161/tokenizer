/**
 * Auth Routes
 * 
 * This file defines the routes for authentication in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Import the AuthView from views
import { AuthView } from '.';

// Legacy components removed
// LoginView removed - replaced by AuthView
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