/**
 * Projects Module Routes
 * 
 * This file defines the routes for the projects module
 */

import { Router } from 'express';
import { ProjectController } from '../controllers';
import { ClientController } from '../../client/controllers/client.controller';
import { requireAuth, requireRole } from '../../accounts/middleware/session.middleware';
import { prisma } from '../utils/prisma';

/**
 * Create and configure the projects module routes
 * @returns Express Router configured with projects routes
 */
export function createProjectsRoutes(): Router {
  const router = Router();
  
  // Initialize controllers
  const clientController = new ClientController(prisma);
  const projectController = new ProjectController();

  // Client routes
  router.post('/clients/apply', requireAuth, clientController.applyAsClient);
  router.get('/clients/me', requireAuth, clientController.getCurrentClientProfile);
  router.put('/clients/me', requireAuth, clientController.updateCurrentClientProfile);
  router.get('/clients/:id', requireAuth, requireRole('ADMIN'), clientController.getClientById);
  router.get('/clients', requireAuth, requireRole('ADMIN'), clientController.listClients);
  router.patch('/clients/:id/status', requireAuth, requireRole('ADMIN'), clientController.updateClientStatus);

  // Project routes (unified functionality for properties and tokens)
  router.get('/projects', requireAuth, projectController.getProjects);
  router.get('/projects/:id', projectController.getProjectById);
  router.post('/projects', requireAuth, requireRole('ADMIN'), projectController.createProject);
  router.put('/projects/:id', requireAuth, requireRole('ADMIN'), projectController.updateProject);
  router.delete('/projects/:id', requireAuth, requireRole('ADMIN'), projectController.deleteProject);
  router.patch('/projects/:id/status', requireAuth, requireRole('ADMIN'), projectController.updateProjectStatus);
  router.get('/projects/stats', requireAuth, requireRole('ADMIN'), projectController.getProjectStats);
  
  // Public project routes
  router.get('/public/featured', projectController.getFeaturedProjects);
  router.get('/public/search', projectController.searchProjects);

  return router;
}
