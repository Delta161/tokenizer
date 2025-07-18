import { defineAsyncComponent } from 'vue';

// Lazy-loaded components
const UserProfileCard = defineAsyncComponent(() => import('./UserProfileCard.vue'));
const UserSettingsForm = defineAsyncComponent(() => import('./UserSettingsForm.vue'));
const UserAvatar = defineAsyncComponent(() => import('./UserAvatar.vue'));
const UserListItem = defineAsyncComponent(() => import('./UserListItem.vue'));
const UserRoleBadge = defineAsyncComponent(() => import('./UserRoleBadge.vue'));

// Export components
export {
  UserProfileCard,
  UserSettingsForm,
  UserAvatar,
  UserListItem,
  UserRoleBadge
};