import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { createNotificationRouter } from './notifications.routes';
import { createNotificationTrigger } from './triggerNotification';
import { NotificationConfig, createNotificationConfig } from './notifications.config';

// Export types and validators
export * from './notifications.types';
export * from './notifications.validators';
export * from './notifications.mapper';

// Export delivery components
export * from './delivery';

// Export notification trigger
export { createNotificationTrigger } from './triggerNotification';

// Export configuration
export { 
  NotificationConfig,
  NotificationChannelConfig,
  defaultNotificationConfig,
  createNotificationConfig 
} from './notifications.config';

// Export router creator
export { createNotificationRouter } from './notifications.routes';

/**
 * Initializes the notification module
 * @param prisma - The Prisma client instance
 * @param config - Optional notification configuration
 * @returns Object containing the initialized service and controller
 */
export const initNotificationModule = (
  prisma: PrismaClient,
  config?: Partial<NotificationConfig>
) => {
  // Create notification configuration
  const notificationConfig = createNotificationConfig(config);
  
  // Initialize service
  const notificationService = new NotificationService(prisma);

  // Initialize controller with service
  const notificationController = new NotificationController(notificationService);

  // Initialize notification trigger with configuration
  const notificationTrigger = createNotificationTrigger(prisma, notificationConfig);

  return {
    service: notificationService,
    controller: notificationController,
    trigger: notificationTrigger,
    config: notificationConfig,
  };
};

/**
 * Mounts notification routes to the provided router
 * @param router - The Express router to mount routes on
 * @param controller - The notification controller instance
 * @param basePath - The base path for notification routes
 */
export const mountNotificationRoutes = (
  router: Router,
  controller: NotificationController,
  basePath: string = '/notifications'
) => {
  // Create notification router
  const notificationRouter = createNotificationRouter(controller);

  // Mount notification router
  router.use(basePath, notificationRouter);
};