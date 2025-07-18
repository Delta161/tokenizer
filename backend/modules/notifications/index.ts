import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { NotificationService } from './services/notifications.service';
import { NotificationController } from './controllers/notifications.controller';
import { createNotificationRouter } from './routes/notifications.routes';
import { createNotificationTrigger } from './hooks/triggerNotification';
import { NotificationConfig, createNotificationConfig } from './config/notification.config';

// Export types and validators
export * from './types/notifications.types';
export * from './validators/notifications.validators';
export * from './utils/notifications.mapper';

// Export delivery components
export * from './delivery';

// Export notification trigger
export { createNotificationTrigger } from './hooks/triggerNotification';

// Export configuration
export { 
  NotificationConfig,
  NotificationChannelConfig,
  defaultNotificationConfig,
  createNotificationConfig 
} from './config/notification.config';

// Export router creator
export { createNotificationRouter } from './routes/notifications.routes';

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