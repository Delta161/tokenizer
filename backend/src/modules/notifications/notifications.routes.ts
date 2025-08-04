import { Router } from 'express';
import { NotificationController } from './notifications.controller';
import { requireAuth, requireRole } from '../accounts/middleware/auth.middleware';
import { UserRole } from '@prisma/client';

/**
 * Creates and configures a router for notification endpoints
 * @param controller - The notification controller instance
 * @returns The configured Express router
 */
export const createNotificationRouter = (controller: NotificationController): Router => {
  const router = Router();

  // Apply authentication middleware to all routes
  router.use(requireAuth);

  // Get all notifications for the authenticated user
  router.get('/', controller.getMyNotifications);

  // Get unread notification count for the authenticated user
  router.get('/unread/count', controller.getUnreadCount);

  // Mark a notification as read
  router.patch('/:id/read', controller.markAsRead);

  // Mark all notifications as read
  router.patch('/read-all', controller.markAllAsRead);

  // Send broadcast notification (admin only)
  router.post('/broadcast', requireRole(UserRole.ADMIN), controller.sendBroadcast);

  return router;
};