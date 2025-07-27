/**
 * Example Routes
 * 
 * This file defines routes for component examples in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Import example components
const UserRoleBadgeExample = defineAsyncComponent(() => import('./UserRoleBadgeExample.vue'));

export const exampleRoutes: RouteRecordRaw[] = [
  {
    path: '/examples/user-role-badge',
    name: 'user-role-badge-example',
    component: UserRoleBadgeExample,
    meta: {
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  }
];