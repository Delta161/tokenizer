// Auth Module Components
import { defineAsyncComponent } from 'vue';

// Import components
import LoginForm from './LoginForm.vue';
import OAuthButtons from './OAuthButtons.vue';

// Lazy-loaded components
const RegisterForm = defineAsyncComponent(() => import('./RegisterForm.vue'));
const ForgotPasswordForm = defineAsyncComponent(() => import('./ForgotPasswordForm.vue'));
const ResetPasswordForm = defineAsyncComponent(() => import('./ResetPasswordForm.vue'));

// Export components
export {
  LoginForm,
  RegisterForm,
  ForgotPasswordForm,
  ResetPasswordForm,
  OAuthButtons
};