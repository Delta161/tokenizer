/**
 * Admin Module Index
 * Exports all components of the admin module
 * Consolidates admin and analytics functionality
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationTrigger } from '../notifications/services/notification.trigger.js';

// Import and re-export routes
export * from './routes';
export { createAdminRouter } from './routes/admin.routes';
export { createAdminAnalyticsRouter } from './routes/admin.analytics.routes';

// Import and re-export controllers
export { AdminController, adminController } from './controllers/admin.controller';
export { AdminAnalyticsController, adminAnalyticsController } from './controllers/admin.analytics.controller';

// Import and re-export services
export { AdminService, adminService } from './services/admin.service';
export { AdminAnalyticsService, adminAnalyticsService } from './services/admin.analytics.service';

// Import and re-export validators
export * from './validators';

// Import and re-export types
export * from './types';

// Import and re-export utils
export * from './utils';

/**
 * Initialize the admin module
 * @param prisma PrismaClient instance
 * @param notificationTrigger NotificationTrigger instance
 * @returns Router with all admin routes mounted
 */
export const initAdminModule = (prisma: PrismaClient, notificationTrigger: NotificationTrigger): Router => {
  // Create service instances
  const adminService = new AdminService(notificationTrigger);
  const adminAnalyticsService = new AdminAnalyticsService();
  
  // Create controller instances
  const adminController = new AdminController(adminService);
  const adminAnalyticsController = new AdminAnalyticsController(adminAnalyticsService);
  
  // Create the main admin router
  const adminRouter = createAdminRouter(adminController);
  
  // Create and mount the analytics subrouter
  const analyticsRouter = createAdminAnalyticsRouter(adminAnalyticsController);
  adminRouter.use('/analytics', analyticsRouter);
  
  // Return the combined router
  return adminRouter;
};