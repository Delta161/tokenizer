import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { ClientService } from '../services/client.service';
import {
  validateClientApplication,
  validateClientUpdate,
  validateClientStatusUpdate,
  validateClientIdParam,
  validateClientListQuery
} from '../validators/client.validators';
import { AuthenticatedRequest } from '../../accounts/types/auth.types';
import { logger } from '../../../utils/logger';
import { PAGINATION } from '../../../config/constants';
import { createPaginationResult, getSkipValue } from '../../../utils/pagination';

/**
 * Controller for client-related operations
 */
export class ClientController {
  private clientService: ClientService;

  constructor(prisma?: PrismaClient) {
    this.clientService = new ClientService(prisma);
  }

  /**
   * POST /clients/apply
   * Apply to become a client
   */
  applyAsClient = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      // Validate request body
      const validation = validateClientApplication(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid client application data',
          details: validation.error.errors
        });
        return;
      }

      // Process client application
      const clientData = validation.data;
      const result = await this.clientService.applyAsClient(req.user.id, clientData);

      res.status(201).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      logger.error('Error in applyAsClient controller:', { error: error.message, stack: error.stack });
      
      if (error.message === 'User already has a client profile') {
        res.status(409).json({
          success: false,
          error: 'ConflictError',
          message: 'User already has a client profile'
        });
        return;
      }

      if (error.message === 'Only users with INVESTOR role can apply as clients') {
        res.status(403).json({
          success: false,
          error: 'ForbiddenError',
          message: 'Only users with INVESTOR role can apply as clients'
        });
        return;
      }

      next(error);
    }
  };

  /**
   * GET /clients/me
   * Get current client profile
   */
  getCurrentClientProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      const result = await this.clientService.getClientByUserId(req.user.id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'NotFoundError',
          message: 'Client profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getCurrentClientProfile controller:', { error });
      next(error);
    }
  };

  /**
   * PATCH /clients/me
   * Update current client profile
   */
  updateCurrentClientProfile = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
          message: 'User not authenticated'
        });
        return;
      }

      // Validate request body
      const validation = validateClientUpdate(req.body);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid client update data',
          details: validation.error.errors
        });
        return;
      }

      // Process client update
      const updateData = validation.data;
      const result = await this.clientService.updateClientProfile(req.user.id, updateData);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'NotFoundError',
          message: 'Client profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in updateCurrentClientProfile controller:', { error });
      next(error);
    }
  };

  /**
   * GET /clients/:id
   * Get client by ID (admin only)
   */
  getClientById = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate client ID parameter
      const validation = validateClientIdParam(req.params);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid client ID',
          details: validation.error.errors
        });
        return;
      }

      const { id } = validation.data;
      const result = await this.clientService.getClientById(id);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'NotFoundError',
          message: 'Client not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in getClientById controller:', { error });
      next(error);
    }
  };

  /**
   * GET /clients
   * List all clients (admin only)
   */
  listClients = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate query parameters
      const validation = validateClientListQuery(req.query);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid query parameters',
          details: validation.error.errors
        });
        return;
      }

      const { page = 1, limit = PAGINATION.DEFAULT_LIMIT, status, search } = validation.data;
      
      // Calculate pagination parameters
      const skip = getSkipValue(page, limit);

      // Get clients with pagination
      const result = await this.clientService.listClients({
        skip,
        take: limit,
        status,
        search
      });

      // Create pagination metadata
      const paginationMeta = createPaginationResult({
        total: result.total,
        page,
        limit
      });

      res.status(200).json({
        success: true,
        data: result.clients,
        pagination: paginationMeta
      });
    } catch (error) {
      logger.error('Error in listClients controller:', { error });
      next(error);
    }
  };

  /**
   * PATCH /clients/:id/status
   * Update client status (admin only)
   */
  updateClientStatus = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Validate client ID parameter
      const idValidation = validateClientIdParam(req.params);
      
      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid client ID',
          details: idValidation.error.errors
        });
        return;
      }

      // Validate request body
      const statusValidation = validateClientStatusUpdate(req.body);
      
      if (!statusValidation.success) {
        res.status(400).json({
          success: false,
          error: 'ValidationError',
          message: 'Invalid status update data',
          details: statusValidation.error.errors
        });
        return;
      }

      const { id } = idValidation.data;
      const { status } = statusValidation.data;

      // Update client status
      const result = await this.clientService.updateClientStatus(id, status);

      if (!result) {
        res.status(404).json({
          success: false,
          error: 'NotFoundError',
          message: 'Client not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error) {
      logger.error('Error in updateClientStatus controller:', { error });
      next(error);
    }
  };
}

// Create a singleton instance for convenience
export const clientController = new ClientController();