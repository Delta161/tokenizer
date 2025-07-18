/**
 * Property Routes
 * Defines API routes for property operations
 */

import { Router } from 'express';
import { propertyController } from './property.controller';
import { authGuard, roleGuard } from '../../middleware/authGuard';

export const createPropertyRoutes = (): Router => {
  const router = Router();

  // Public routes - accessible without authentication
  router.get('/approved', propertyController.getApprovedProperties);
  router.get('/approved/:propertyId', propertyController.getApprovedPropertyById);

  // Client routes - require client authentication
  router.get('/my', authGuard, roleGuard(['CLIENT']), propertyController.getClientProperties);
  router.post('/', authGuard, roleGuard(['CLIENT']), propertyController.createProperty);
  router.put('/:propertyId', authGuard, propertyController.updateProperty); // Role check in controller
  router.delete('/:propertyId', authGuard, propertyController.deleteProperty); // Role check in controller

  // Admin routes - require admin authentication
  router.get('/', authGuard, roleGuard(['ADMIN']), propertyController.getProperties);
  router.get('/:propertyId', authGuard, propertyController.getPropertyById); // Role check in controller
  router.patch('/:propertyId/status', authGuard, roleGuard(['ADMIN']), propertyController.updatePropertyStatus);

  return router;
};

export default createPropertyRoutes;