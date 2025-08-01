/**
 * Views Index
 * 
 * This file exports all views from the Accounts module.
 */

export { authRoutes } from './authRoutes';
export { kycRoutes } from './kycRoutes';

// Export view components for Auth
export { default as AuthView } from './auth.view.vue';
// LoginView removed - replaced by AuthView
// RegisterView removed - only OAuth authentication is supported
// ForgotPasswordView and ResetPasswordView removed - only OAuth authentication is supported

// Export view components for User
export { default as UserProfileView } from './UserProfile.view.vue';
export { default as UserSettingsView } from './UserSettingsView.vue';
export { default as UserListView } from './UserListView.vue';
export { default as UserDetailView } from './UserDetailView.vue';

// Export view components for KYC
export { default as KycVerificationPage } from './KycVerificationPage.vue';
export { default as KycCallbackPage } from './KycCallbackPage.vue';