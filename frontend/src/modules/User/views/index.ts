import { defineAsyncComponent } from 'vue';

// Lazy-loaded view components
const UserProfileView = defineAsyncComponent(() => import('./UserProfileView.vue'));
const UserSettingsView = defineAsyncComponent(() => import('./UserSettingsView.vue'));
const UserListView = defineAsyncComponent(() => import('./UserListView.vue'));
const UserDetailView = defineAsyncComponent(() => import('./UserDetailView.vue'));

// Export view components
export {
  UserProfileView,
  UserSettingsView,
  UserListView,
  UserDetailView
};

// Export route configuration
export const userRoutes = [
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: UserSettingsView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/users',
    name: 'users',
    component: UserListView,
    meta: {
      requiresAuth: true,
      requiresRole: ['ADMIN'],
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: UserDetailView,
    meta: {
      requiresAuth: true,
      layout: 'DefaultLayout'
    }
  }
];