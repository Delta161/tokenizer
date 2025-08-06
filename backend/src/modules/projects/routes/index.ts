/**
 * Projects Module Routes Index
 * Main entry point for all project-related routes
 */

import { Router } from 'express';
import { projectRoutes } from './project.routes';

const router = Router();

// Mount project routes at the root level
// Final paths will be /api/projects/* when mounted in app
router.use('/', projectRoutes);

export { router as projectModuleRoutes };

// Keep legacy export for backward compatibility if needed
export { projectRoutes as createProjectsRoutes };