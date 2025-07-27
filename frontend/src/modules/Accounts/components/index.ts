/**
 * Components Index
 * 
 * This file exports all components from the Accounts module.
 */

import { defineAsyncComponent } from 'vue';

// User Components
export const UserProfileCard = defineAsyncComponent(() => import('./UserProfileCard.vue'));
export const UserSettingsForm = defineAsyncComponent(() => import('./UserSettingsForm.vue'));
export const UserAvatar = defineAsyncComponent(() => import('./UserAvatar.vue'));
export const UserListItem = defineAsyncComponent(() => import('./UserListItem.vue'));
export const UserRoleBadge = defineAsyncComponent(() => import('./UserRoleBadge.vue'));

// Auth Components
export const AuthView = defineAsyncComponent(() => import('./AuthView.vue')); // New merged auth component
export const OAuthButtons = defineAsyncComponent(() => import('./OAuthButtons.vue'));
// Legacy components - kept for backward compatibility
export const LoginForm = defineAsyncComponent(() => import('./LoginForm.vue'));
// RegisterForm removed - only OAuth authentication is supported
// ForgotPasswordForm removed - only OAuth authentication is supported

// KYC Components
export const KycVerificationStatus = defineAsyncComponent(() => import('./KycVerificationStatus.vue'));