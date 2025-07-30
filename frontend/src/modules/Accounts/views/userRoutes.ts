/**
 * User Routes
 * 
 * This file defines the routes for the User module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Lazy-loaded components
const UserProfileView = defineAsyncComponent(() => import('./UserProfile.view.vue'));
const UserSettingsView = defineAsyncComponent(() => import('./UserSettingsView.vue'));
const UserListView = defineAsyncComponent(() => import('./UserListView.vue'));
const UserDetailView = defineAsyncComponent(() => import('./UserDetailView.vue'));

export const userRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'profile',
    component: UserProfileView,
    meta: {
      requiresAuth: true,
      layout: 'dashboard'
    }
  },
  {
    path: '/settings',
    name: 'settings',
    component: UserSettingsView,
    meta: {
      requiresAuth: true,
      layout: 'dashboard'
    }
  },
  {
    path: '/users',
    name: 'users',
    component: UserListView,
    meta: {
      requiresAuth: true,
      requiresAdmin: true,
      layout: 'dashboard'
    }
  },
  {
    path: '/users/:id',
    name: 'user-detail',
    component: UserDetailView,
    meta: {
      requiresAuth: true,
      layout: 'dashboard'
    }
  }
];