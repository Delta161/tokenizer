import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../../accounts/middleware/auth.middleware';
import { requireAdmin } from '../../accounts/middleware/user.middleware';

export function createAdminRouter(adminController: AdminController): Router {
  const router = Router();

  // Apply authentication and admin role middleware to all routes
  router.use(requireAuth);
  router.use(requireAdmin);

  // User management routes
  router.get('/users', adminController.getUsers);
  router.patch('/users/:userId/role', adminController.updateUserRole);
  router.patch('/users/:userId/status', adminController.updateUserStatus);

  // Property management routes
  router.patch('/properties/:propertyId/moderate', adminController.moderateProperty);

  // Notification routes
  router.post('/notifications/broadcast', adminController.sendBroadcastNotification);

  return router;
}