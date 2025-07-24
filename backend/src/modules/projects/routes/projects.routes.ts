/**
 * Projects Module Routes
 * 
 * This file defines the routes for the projects module
 */

import { Router } from 'express';
import { ClientController, PropertyController, TokenController, ProjectController } from '../controllers';
import { requireAuth, requireRole } from '../../accounts/middleware/auth.middleware';
import { BlockchainService, getBlockchainConfig } from '../../blockchain/services/blockchain.service.js';
import { prisma } from '../utils/prisma';

/**
 * Create and configure the projects module routes
 * @returns Express Router configured with projects routes
 */
export function createProjectsRoutes(): Router {
  const router = Router();
  
  // Initialize controllers
  const clientController = new ClientController(prisma);
  const propertyController = new PropertyController(prisma);
  const blockchainService = new BlockchainService(getBlockchainConfig());
  const tokenController = new TokenController(prisma, blockchainService);
  const projectController = new ProjectController(prisma);

  // Client routes
  router.post('/clients/apply', requireAuth, clientController.applyAsClient);
  router.get('/clients/me', requireAuth, clientController.getCurrentClientProfile);
  router.put('/clients/me', requireAuth, clientController.updateClientProfile);
  router.get('/clients/:id', requireAuth, requireRole('ADMIN'), clientController.getClientById);
  router.get('/clients', requireAuth, requireRole('ADMIN'), clientController.listClients);
  router.patch('/clients/:id/status', requireAuth, requireRole('ADMIN'), clientController.updateClientStatus);

  // Property routes
  router.get('/properties', requireAuth, requireRole('ADMIN'), propertyController.getProperties);
  router.get('/properties/public', propertyController.getPublicProperties);
  router.get('/properties/client/:clientId', requireAuth, propertyController.getClientProperties);
  router.get('/properties/:id', propertyController.getPropertyById);
  router.post('/properties', requireAuth, propertyController.createProperty);
  router.put('/properties/:id', requireAuth, propertyController.updateProperty);
  router.patch('/properties/:id/status', requireAuth, requireRole('ADMIN'), propertyController.updatePropertyStatus);

  // Token routes
  router.post('/tokens', requireAuth, requireRole('ADMIN'), tokenController.create);
  router.put('/tokens/:id', requireAuth, requireRole('ADMIN'), tokenController.update);
  router.get('/tokens/:id', tokenController.getById);
  router.get('/tokens', tokenController.list);
  router.get('/tokens/balance', tokenController.getBalance);
  router.get('/tokens/metadata/:contractAddress', tokenController.getMetadata);

  // Project routes (combined client, property, and token data)
  router.get('/combined', requireAuth, projectController.listProjects);
  router.get('/combined/:id', projectController.getProjectById);
  router.get('/featured', projectController.getFeaturedProjects);

  return router;
}
