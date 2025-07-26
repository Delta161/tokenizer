/**
 * KYC Routes
 * 
 * This file defines the routes for KYC verification in the Accounts module.
 */

import type { RouteRecordRaw } from 'vue-router';
import { defineAsyncComponent } from 'vue';

// Lazy-loaded components
const KycVerificationPage = defineAsyncComponent(() => import('./KycVerificationPage.vue'));
const KycCallbackPage = defineAsyncComponent(() => import('./KycCallbackPage.vue'));

export const kycRoutes: RouteRecordRaw[] = [
  {
    path: '/account/kyc',
    name: 'kyc-verification',
    component: KycVerificationPage,
    meta: {
      requiresAuth: true,
      layout: 'dashboard'
    }
  },
  {
    path: '/account/kyc/callback',
    name: 'kyc-callback',
    component: KycCallbackPage,
    meta: {
      requiresAuth: true,
      layout: 'dashboard'
    }
  }
];