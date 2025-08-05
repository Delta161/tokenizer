/**
 * Example Routes
 * 
 * This file defines routes for component examples in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Import example components
const UserRoleBadgeExample = defineAsyncComponent(() => import('./UserRoleBadgeExample.vue'));
const LoginRouteTest = defineAsyncComponent(() => import('./LoginRouteTest.vue'));
const OAuthButtonsTest = defineAsyncComponent(() => import('./OAuthButtonsTest.vue'));

export const exampleRoutes: RouteRecordRaw[] = [
  {
    path: '/examples/user-role-badge',
    name: 'user-role-badge-example',
    component: UserRoleBadgeExample,
    meta: {
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/examples/login-route-test',
    name: 'login-route-test',
    component: LoginRouteTest,
    meta: {
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  },
  {
    path: '/examples/oauth-buttons-test',
    name: 'oauth-buttons-test',
    component: OAuthButtonsTest,
    meta: {
      requiresAuth: false,
      layout: 'DefaultLayout'
    }
  }
];