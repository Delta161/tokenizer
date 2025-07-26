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
export const LoginForm = defineAsyncComponent(() => import('./LoginForm.vue'));
export const OAuthButtons = defineAsyncComponent(() => import('./OAuthButtons.vue'));
export const RegisterForm = defineAsyncComponent(() => import('./RegisterForm.vue'));
export const ForgotPasswordForm = defineAsyncComponent(() => import('./ForgotPasswordForm.vue'));
export const ResetPasswordForm = defineAsyncComponent(() => import('./ResetPasswordForm.vue'));