/**
 * Client Routes
 * Defines the routes for client-related pages
 */

import { type RouteRecordRaw } from "vue-router";

/**
 * Client routes configuration
 */
const clientRoutes: RouteRecordRaw[] = [
  {
    path: '/client',
    name: 'client',
    component: () => import('../views/ClientDashboard.vue'),
    meta: {
      requiresAuth: true,
      title: 'Client Dashboard'
    }
  },
  {
    path: '/client/profile',
    name: 'client-profile',
    component: () => import('../views/ClientProfile.vue'),
    meta: {
      requiresAuth: true,
      title: 'Client Profile'
    }
  },
  {
    path: '/client/apply',
    name: 'client-application',
    component: () => import('../views/ClientApplicationForm.vue'),
    meta: {
      requiresAuth: true,
      title: 'Client Application'
    }
  },
  {
    path: '/client/application-submitted',
    name: 'client-application-submitted',
    component: () => import('../views/ClientApplicationSubmitted.vue'),
    meta: {
      requiresAuth: true,
      title: 'Application Submitted'
    }
  }
]

export default clientRoutes