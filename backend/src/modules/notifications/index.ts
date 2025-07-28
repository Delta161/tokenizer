import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { UserService } from '../accounts/services/user.service';
import { NotificationService } from './services/notification.service';
import { NotificationController } from './controllers/notification.controller';
import { createNotificationRouter } from './routes/notification.routes';
import { NotificationTrigger, createNotificationTrigger } from './services/notification.trigger';
import { NotificationDispatcherService } from './services/dispatcher.service';
import { createNotificationChannels } from './services/channels';
import { NotificationConfig, getNotificationConfig } from './utils/notification.config';

// Export types and validators
export * from './types/notification.types';
export * from './validators/notification.validators';
export * from './utils/notification.mapper';

// Export services
export * from './services/notification.service';
export * from './services/notification.trigger';
export * from './services/dispatcher.service';
export * from './services/channels';

// Export configuration
export { 
  NotificationConfig,
  NotificationChannelConfig,
  defaultNotificationConfig,
  getNotificationConfig 
} from './utils/notification.config';

// Export router creator
export { createNotificationRouter } from './routes/notification.routes';

/**
 * Initializes the notification module
 * @param prisma - The Prisma client instance
 * @param userService - User service instance
 * @param config - Optional notification configuration
 * @returns Object containing the initialized service, controller, and router
 */
export const initNotificationModule = (
  prisma: PrismaClient,
  userService: UserService,
  config?: Partial<NotificationConfig>
) => {
  // Get notification configuration
  const notificationConfig = getNotificationConfig();
  
  // Initialize service
  const notificationService = new NotificationService(prisma);

  // Create notification channels
  const channels = createNotificationChannels(notificationConfig);

  // Create notification dispatcher
  const notificationDispatcher = new NotificationDispatcherService(userService, channels);

  // Initialize notification trigger
  const notificationTrigger = createNotificationTrigger(
    notificationService,
    notificationDispatcher
  );

  // Initialize controller with service and trigger
  const notificationController = new NotificationController(
    notificationService,
    notificationTrigger
  );

  // Create router
  const router = createNotificationRouter(
    notificationController
  );

  return {
    service: notificationService,
    controller: notificationController,
    trigger: notificationTrigger,
    dispatcher: notificationDispatcher,
    router,
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

/**
 * Initialize the notifications module and return the router
 * @param prisma - Prisma client instance
 * @param userService - User service instance
 * @returns Router for notifications endpoints
 */
export const initNotificationsRouter = (
  prisma: PrismaClient,
  userService: UserService
): Router => {
  const { router } = initNotificationModule(prisma, userService);
  return router;
};