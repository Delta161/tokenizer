import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { NotificationService } from './services/notifications.service';
import { NotificationController } from './controllers/notifications.controller';
import { NotificationConfig } from './config/notification.config';
export * from './types/notifications.types';
export * from './validators/notifications.validators';
export * from './utils/notifications.mapper';
export * from './delivery';
export { createNotificationTrigger } from './hooks/triggerNotification';
export { NotificationConfig, NotificationChannelConfig, defaultNotificationConfig, createNotificationConfig } from './config/notification.config';
export { createNotificationRouter } from './routes/notifications.routes';
/**
 * Initializes the notification module
 * @param prisma - The Prisma client instance
 * @param config - Optional notification configuration
 * @returns Object containing the initialized service and controller
 */
export declare const initNotificationModule: (prisma: PrismaClient, config?: Partial<NotificationConfig>) => {
    service: NotificationService;
    controller: NotificationController;
    trigger: import("./hooks/triggerNotification").NotificationTrigger;
    config: NotificationConfig;
};
/**
 * Mounts notification routes to the provided router
 * @param router - The Express router to mount routes on
 * @param controller - The notification controller instance
 * @param basePath - The base path for notification routes
 */
export declare const mountNotificationRoutes: (router: Router, controller: NotificationController, basePath?: string) => void;
//# sourceMappingURL=index.d.ts.map