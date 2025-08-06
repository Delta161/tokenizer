/**
 * Project Controller
 * HTTP request/response handling for the Projects module
 * Integrates with Phase 2 Service Layer and Phase 1 Validators
 */

import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';
import { projectService } from '../services/project.service';
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  ProjectFiltersSchema,
  ProjectPaginationSchema,
  GetProjectParamsSchema,
  UpdateProjectStatusSchema,
  SearchProjectsSchema
} from '../validators/project.validators';
import {
  ProjectError,
  ProjectNotFoundError,
  ProjectAccessError,
  ProjectValidationError,
  CreateProjectInput,
  UpdateProjectInput,
  ProjectSummary
} from '../types/project.types';

/**
 * Authenticated request interface
 */
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
    clientId?: string;
  };
}

export class ProjectController {
  /**
   * Create a new project
   * POST /api/projects
   */
  async createProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate input
      const validation = CreateProjectSchema.safeParse(req.body);
      if (!validation.success) {
        return next(createError(400, 'Invalid project data', { 
          details: validation.error.issues 
        }));
      }

      // Check if user has client role or access
      if (!req.user?.clientId && req.user?.role !== 'CLIENT') {
        return next(createError(403, 'Only clients can create projects'));
      }

      const clientId = req.user.clientId || req.user.id;
      
      // Create project using service
      const project = await projectService.createProject(validation.data, clientId);

      res.status(201).json({
        success: true,
        data: project,
        message: 'Project created successfully'
      });
    } catch (error) {
      if (error instanceof ProjectValidationError) {
        return next(createError(400, error.message));
      }
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Get projects with filtering, pagination, and sorting
   * GET /api/projects
   */
  async getProjects(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate pagination parameters
      const paginationValidation = ProjectPaginationSchema.safeParse({
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      });

      if (!paginationValidation.success) {
        return next(createError(400, 'Invalid pagination parameters', {
          details: paginationValidation.error.issues
        }));
      }

      // Validate filters
      const filtersValidation = ProjectFiltersSchema.safeParse(req.query);
      if (!filtersValidation.success) {
        return next(createError(400, 'Invalid filter parameters', {
          details: filtersValidation.error.issues
        }));
      }

      // Build query options
      const options = {
        ...paginationValidation.data,
        filters: filtersValidation.data,
        includeRelations: true,
        includeCounts: true
      };

      // Apply client filter if user is a client
      if (req.user?.role === 'CLIENT' && req.user.clientId) {
        options.filters.clientId = req.user.clientId;
      }

      // Get projects using service
      const result = await projectService.getProjects(options);

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        message: 'Projects retrieved successfully'
      });
    } catch (error) {
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Get a single project by ID
   * GET /api/projects/:id
   */
  async getProjectById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate project ID
      const validation = GetProjectParamsSchema.safeParse(req.params);
      if (!validation.success) {
        return next(createError(400, 'Invalid project ID'));
      }

      const { id } = validation.data;
      const clientId = req.user?.role === 'CLIENT' ? req.user.clientId : undefined;

      // Get project using service
      const project = await projectService.getProjectById(id, {
        includeRelations: true,
        includeCounts: true,
        clientId
      });

      if (!project) {
        return next(createError(404, 'Project not found'));
      }

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project retrieved successfully'
      });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return next(createError(404, error.message));
      }
      if (error instanceof ProjectAccessError) {
        return next(createError(403, error.message));
      }
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Update a project
   * PATCH /api/projects/:id
   */
  async updateProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate project ID
      const paramsValidation = GetProjectParamsSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        return next(createError(400, 'Invalid project ID'));
      }

      // Validate update data
      const bodyValidation = UpdateProjectSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return next(createError(400, 'Invalid update data', {
          details: bodyValidation.error.issues
        }));
      }

      const { id } = paramsValidation.data;
      const clientId = req.user?.role === 'CLIENT' ? req.user.clientId : undefined;

      // Update project using service
      const project = await projectService.updateProject(id, bodyValidation.data, clientId);

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project updated successfully'
      });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return next(createError(404, error.message));
      }
      if (error instanceof ProjectAccessError) {
        return next(createError(403, error.message));
      }
      if (error instanceof ProjectValidationError) {
        return next(createError(400, error.message));
      }
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Delete a project
   * DELETE /api/projects/:id
   */
  async deleteProject(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate project ID
      const validation = GetProjectParamsSchema.safeParse(req.params);
      if (!validation.success) {
        return next(createError(400, 'Invalid project ID'));
      }

      const { id } = validation.data;
      const clientId = req.user?.role === 'CLIENT' ? req.user.clientId : undefined;

      // Delete project using service
      await projectService.deleteProject(id, clientId);

      res.status(204).send();
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return next(createError(404, error.message));
      }
      if (error instanceof ProjectAccessError) {
        return next(createError(403, error.message));
      }
      if (error instanceof ProjectValidationError) {
        return next(createError(400, error.message));
      }
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Update project status
   * PATCH /api/projects/:id/status
   */
  async updateProjectStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      // Validate project ID
      const paramsValidation = GetProjectParamsSchema.safeParse(req.params);
      if (!paramsValidation.success) {
        return next(createError(400, 'Invalid project ID'));
      }

      // Validate status update data
      const bodyValidation = UpdateProjectStatusSchema.safeParse(req.body);
      if (!bodyValidation.success) {
        return next(createError(400, 'Invalid status data', {
          details: bodyValidation.error.issues
        }));
      }

      const { id } = paramsValidation.data;
      const { status, reason } = bodyValidation.data;
      const clientId = req.user?.role === 'CLIENT' ? req.user.clientId : undefined;

      // Update status using service
      const project = await projectService.updateProjectStatus(id, status, clientId, reason);

      res.status(200).json({
        success: true,
        data: project,
        message: 'Project status updated successfully'
      });
    } catch (error) {
      if (error instanceof ProjectNotFoundError) {
        return next(createError(404, error.message));
      }
      if (error instanceof ProjectAccessError) {
        return next(createError(403, error.message));
      }
      if (error instanceof ProjectValidationError) {
        return next(createError(400, error.message));
      }
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Get project statistics
   * GET /api/projects/stats
   */
  async getProjectStats(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const clientId = req.user?.role === 'CLIENT' ? req.user.clientId : undefined;

      // Get stats using service
      const stats = await projectService.getProjectStats(clientId);

      res.status(200).json({
        success: true,
        data: stats,
        message: 'Project statistics retrieved successfully'
      });
    } catch (error) {
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Get featured projects
   * GET /api/projects/featured
   */
  async getFeaturedProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = parseInt(req.query.limit as string) || 6;
      
      if (limit < 1 || limit > 50) {
        return next(createError(400, 'Limit must be between 1 and 50'));
      }

      // Get featured projects using service
      const projects = await projectService.getFeaturedProjects(limit);

      res.status(200).json({
        success: true,
        data: projects,
        message: 'Featured projects retrieved successfully'
      });
    } catch (error) {
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }

  /**
   * Search projects
   * GET /api/projects/search
   */
  async searchProjects(req: Request, res: Response, next: NextFunction) {
    try {
      // Validate search parameters
      const validation = SearchProjectsSchema.safeParse(req.query);
      if (!validation.success) {
        return next(createError(400, 'Invalid search parameters', {
          details: validation.error.issues
        }));
      }

      const { q: searchTerm, page, limit, sortBy, sortOrder } = validation.data;

      // Search projects using service
      const result = await projectService.searchProjects(searchTerm, {
        page,
        limit,
        sortBy,
        sortOrder,
        includeRelations: true
      });

      res.status(200).json({
        success: true,
        data: result.projects,
        pagination: result.pagination,
        message: 'Search completed successfully'
      });
    } catch (error) {
      if (error instanceof ProjectError) {
        return next(createError(500, error.message));
      }
      next(error);
    }
  }
}

// Export an instance for easy importing
export const projectController = new ProjectController();