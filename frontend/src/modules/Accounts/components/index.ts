/**
 * Components Index
 * 
 * This file exports all components from the Accounts module.
 */

import { defineAsyncComponent } from 'vue';

// User Components
// UserProfileCard moved to sections/common/UserProfileSection.vue
export const UserComponent = defineAsyncComponent(() => import('./user.component.vue'));
export const UserRoleBadge = defineAsyncComponent(() => import('./UserRoleBadge.vue'));

// Auth Components
export const AuthComponent = defineAsyncComponent(() => import('./auth.component.vue')); // Component part of the auth view
// Legacy components removed - only OAuth authentication is supported
// LoginForm removed - only OAuth authentication is supported
// RegisterForm removed - only OAuth authentication is supported
// ForgotPasswordForm removed - only OAuth authentication is supported
// AuthView moved to views directory and split into component/view

// KYC Components
export const KycVerificationStatus = defineAsyncComponent(() => import('./kyc.component.vue'));