/**
 * Project Controller
 * 
 * This controller handles operations that combine client, property, and token data
 * into unified project resources.
 */

import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { ClientController } from './client.controller';
import { PropertyController } from './property.controller';
import { TokenController } from './token.controller';
import {
  ProjectDTO,
  ProjectListResponse,
  ProjectResponse,
  ProjectFilterOptions,
  ErrorResponse
} from '../types';
import {
  ProjectListQuerySchema,
  ProjectIdParamsSchema,
  FeaturedProjectsQuerySchema
} from '../validators';
import { mapToProjectDTO } from '../utils';
import { PAGINATION } from '@config/constants';
import { createPaginationResult, getSkipValue } from '@utils/pagination';

export class ProjectController {
  private prisma: PrismaClient;
  private clientController: ClientController;
  private propertyController: PropertyController;
  private tokenController: TokenController;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.clientController = new ClientController(prisma);
    this.propertyController = new PropertyController(prisma);
    this.tokenController = new TokenController(prisma);
  }

  /**
 * Get a list of projects (properties with their associated client and token data)
 */
public listProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationResult = ProjectListQuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // Extract validated query parameters
    const options = validationResult.data;

    // Use the service to get projects
     const { projects, total } = await this.projectService.listProjects(options);

     // Prepare and send response using standardized pagination
     const result = createPaginationResult({
       data: projects,
       total,
       page: options.page,
       limit: options.limit,
       skip: getSkipValue(options.page, options.limit)
     });
     
     const response: ProjectListResponse = {
       success: true,
       data: result.data,
       meta: result.meta
     };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in listProjects:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while fetching projects',
    };
    res.status(500).json(errorResponse);
  }
};

  /**
 * Get a single project by property ID
 */
public getProjectById = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate ID parameter
    const validationResult = ProjectIdParamsSchema.safeParse(req.params);
    
    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid property ID',
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    const { id } = validationResult.data;

    // Use the service to get project by ID
    const project = await this.projectService.getProjectById(id);

    // Check if project exists
    if (!project) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'NOT_FOUND',
        message: 'Project not found',
      };
      res.status(404).json(errorResponse);
      return;
    }

    // Prepare and send response
    const response: ProjectResponse = {
      success: true,
      data: project,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getProjectById:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while fetching the project',
    };
    res.status(500).json(errorResponse);
  }
};

  /**
 * Get featured projects for public display
 */
public getFeaturedProjects = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validate query parameters
    const validationResult = FeaturedProjectsQuerySchema.safeParse(req.query);
    
    if (!validationResult.success) {
      const errorResponse: ErrorResponse = {
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid query parameters',
      };
      res.status(400).json(errorResponse);
      return;
    }
    
    // Extract validated query parameters
    const { limit } = validationResult.data;

    // Use the service to get featured projects
    const projects = await this.projectService.getFeaturedProjects(limit);

    // Prepare and send response
    const response: ProjectListResponse = {
      success: true,
      data: projects,
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getFeaturedProjects:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An error occurred while fetching featured projects',
    };
    res.status(500).json(errorResponse);
  }
};
}