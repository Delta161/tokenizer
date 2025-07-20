import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { NotificationTrigger } from '../notifications/services/notification.trigger.js';
/**
 * Initialize the admin module
 */
export declare const initAdminModule: (prisma: PrismaClient, notificationTrigger: NotificationTrigger) => Router;
//# sourceMappingURL=index.d.ts.map