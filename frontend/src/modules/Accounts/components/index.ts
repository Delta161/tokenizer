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