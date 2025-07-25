import { Router } from 'express';
import { AdminController } from './admin.controller.js';
import { requireAuth, requireRole } from '../../middleware/auth.middleware.js';

export function createAdminRouter(adminController: AdminController): Router {
  const router = Router();

  // Apply authentication and admin role middleware to all routes
  router.use(requireAuth);
  router.use(requireRole('ADMIN'));

  // User management routes
  router.get('/users', adminController.getUsers.bind(adminController));
  router.get('/users/:userId', adminController.getUserById.bind(adminController));
  router.patch('/users/:userId/role', adminController.updateUserRole.bind(adminController));
  router.patch('/users/:userId/status', adminController.updateUserStatus.bind(adminController));

  // Property management routes
  router.get('/properties', adminController.getProperties.bind(adminController));
  router.get('/properties/:propertyId', adminController.getPropertyById.bind(adminController));
  router.patch('/properties/:propertyId/moderate', adminController.moderateProperty.bind(adminController));

  // Token management routes
  router.get('/tokens', adminController.getTokens.bind(adminController));
  router.get('/tokens/:tokenId', adminController.getTokenById.bind(adminController));

  // KYC management routes
  router.get('/kyc-records', adminController.getKycRecords.bind(adminController));
  router.get('/kyc-records/:kycId', adminController.getKycRecordById.bind(adminController));

  // Notification routes
  router.post('/notifications/broadcast', adminController.sendBroadcastNotification.bind(adminController));

  return router;
}