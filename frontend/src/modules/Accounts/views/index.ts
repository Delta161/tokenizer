/**
 * Views Index
 * 
 * This file exports all views from the Accounts module.
 */

export { userRoutes } from './userRoutes';
export { authRoutes } from './authRoutes';

// Export view components for Auth
export { default as LoginView } from './LoginView.vue';
export { default as RegisterView } from './RegisterView.vue';
export { default as ForgotPasswordView } from './ForgotPasswordView.vue';
export { default as ResetPasswordView } from './ResetPasswordView.vue';

// Export view components for User
export { default as UserProfileView } from './UserProfileView.vue';
export { default as UserSettingsView } from './UserSettingsView.vue';
export { default as UserListView } from './UserListView.vue';
export { default as UserDetailView } from './UserDetailView.vue';