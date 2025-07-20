import { PrismaClient } from '@prisma/client';
import { Router } from 'express';
import { NotificationService } from './notifications.service';
import { NotificationController } from './notifications.controller';
import { NotificationConfig } from './notifications.config';
export * from './notifications.types';
export * from './notifications.validators';
export * from './notifications.mapper';
export * from './delivery';
export { createNotificationTrigger } from './triggerNotification';
export { NotificationConfig, NotificationChannelConfig, defaultNotificationConfig, createNotificationConfig } from './notifications.config';
export { createNotificationRouter } from './notifications.routes';
/**
 * Initializes the notification module
 * @param prisma - The Prisma client instance
 * @param config - Optional notification configuration
 * @returns Object containing the initialized service and controller
 */
export declare const initNotificationModule: (prisma: PrismaClient, config?: Partial<NotificationConfig>) => {
    service: NotificationService;
    controller: NotificationController;
    trigger: import("./triggerNotification").NotificationTriggerInterface;
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