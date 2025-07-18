import { defineAsyncComponent } from 'vue';

// Lazy-loaded view components
const LoginView = defineAsyncComponent(() => import('./LoginView.vue'));
const RegisterView = defineAsyncComponent(() => import('./RegisterView.vue'));
const ForgotPasswordView = defineAsyncComponent(() => import('./ForgotPasswordView.vue'));
const ResetPasswordView = defineAsyncComponent(() => import('./ResetPasswordView.vue'));

// Export view components
export {
  LoginView,
  RegisterView,
  ForgotPasswordView,
  ResetPasswordView
};

// Export route configuration
export const authRoutes = [
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