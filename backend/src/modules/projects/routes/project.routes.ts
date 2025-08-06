/**
 * Project Routes
 * HTTP endpoint definitions for the Projects module
 * 
 * This file defines all HTTP routes for project operations including:
 * - CRUD operations (Create, Read, Update, Delete)
 * - Status management and workflow operations
 * - Search and filtering capabilities
 * - Analytics and statistics endpoints
 * - Featured projects and discovery features
 */

import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { requireAuth } from '../../accounts/middleware/session.middleware';
import { requireRole } from '../../accounts/middleware/user.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(requireAuth);

/**
 * Core CRUD Operations
 */

// Create a new project
// POST /api/projects
// Requires: CLIENT role or admin access
// Body: CreateProjectInput (validated by CreateProjectSchema)
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), 
  projectController.createProject
);

// Get projects with filtering, pagination, and sorting
// GET /api/projects
// Query params: page, limit, sortBy, sortOrder, status, country, city, minPrice, maxPrice, clientId
// Returns: Paginated list of projects with metadata
router.get('/', 
  projectController.getProjects
);

// Get a specific project by ID
// GET /api/projects/:id
// Params: id (project ID)
// Returns: Full project details with relations
router.get('/:id', 
  projectController.getProjectById
);

// Update a project
// PUT /api/projects/:id
// Requires: Project ownership (CLIENT) or ADMIN role
// Params: id (project ID)  
// Body: UpdateProjectInput (validated by UpdateProjectSchema)
router.put('/:id', 
  projectController.updateProject
);

// Delete a project
// DELETE /api/projects/:id
// Requires: Project ownership (CLIENT) or ADMIN role
// Params: id (project ID)
router.delete('/:id', 
  projectController.deleteProject
);

/**
 * Status Management & Workflow
 */

// Update project status (for workflow management)
// PATCH /api/projects/:id/status
// Requires: ADMIN role for status changes
// Params: id (project ID)
// Body: { status: ProjectStatus, reason?: string }
router.patch('/:id/status', 
  requireRole(['ADMIN']), 
  projectController.updateProjectStatus
);

/**
 * Analytics & Statistics
 */

// Get project statistics and metrics
// GET /api/projects/stats
// Requires: ADMIN role for full stats
// Returns: Project counts by status, investment metrics, performance data
router.get('/stats', 
  requireRole(['ADMIN']), 
  projectController.getProjectStats
);

/**
 * Discovery & Features
 */

// Get featured projects (publicly visible, high-performing projects)
// GET /api/projects/featured
// Query params: limit (optional, default 10)
// Returns: List of featured projects for homepage/discovery
router.get('/featured', 
  projectController.getFeaturedProjects
);

// Search projects by text query
// GET /api/projects/search
// Query params: q (search term), page, limit, sortBy, sortOrder
// Returns: Projects matching search criteria with relevance scoring
router.get('/search', 
  projectController.searchProjects
);

/**
 * Export the configured router
 */
export { router as projectRoutes };

/**
 * Route Summary:
 * 
 * PUBLIC ACCESS:
 * - GET /api/projects (browse projects with filters)
 * - GET /api/projects/:id (view project details) 
 * - GET /api/projects/featured (featured projects)
 * - GET /api/projects/search (search projects)
 * 
 * CLIENT ACCESS:
 * - POST /api/projects (create new project)
 * - PUT /api/projects/:id (update own project)
 * - DELETE /api/projects/:id (delete own project)
 * 
 * ADMIN ACCESS:
 * - PATCH /api/projects/:id/status (change project status)
 * - GET /api/projects/stats (view analytics)
 * - Full access to all CLIENT operations on any project
 */
