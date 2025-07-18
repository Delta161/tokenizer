import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller.js';
import { requireAuth } from '../../auth/middleware/requireAuth.js';
import { requireAdmin } from '../../auth/middleware/requireRole.js';

export const createAdminRouter = (adminController: AdminController): Router => {
  const router = Router();

  // Apply authentication and admin role middleware to all routes
  router.use(requireAuth, requireAdmin);

  // User management routes
  router.get('/users', adminController.getUsers);
  router.get('/users/:userId', adminController.getUserById);
  router.patch('/users/:userId/role', adminController.updateUserRole);
  router.patch('/users/:userId/status', adminController.updateUserStatus);

  // Property management routes
  router.get('/properties', adminController.getProperties);
  router.get('/properties/:propertyId', adminController.getPropertyById);
  router.patch('/properties/:propertyId/moderate', adminController.moderateProperty);

  // Token management routes
  router.get('/tokens', adminController.getTokens);
  router.get('/tokens/:tokenId', adminController.getTokenById);

  // KYC management routes
  router.get('/kyc', adminController.getKycRecords);
  router.get('/kyc/:kycId', adminController.getKycRecordById);

  // Notification routes
  router.post('/notifications/broadcast', adminController.sendBroadcastNotification);

  return router;
};