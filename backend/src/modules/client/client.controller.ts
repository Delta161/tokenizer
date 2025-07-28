import { Request, Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { ClientService } from './client.service';
import {
  validateClientApplication,
  validateClientUpdate,
  validateClientStatusUpdate,
  validateClientIdParam,
  validateClientListQuery
} from './client.validators';
import { AuthenticatedRequest } from '../accounts/types/auth.types';
import { logger } from '../../utils/logger';
import { PAGINATION } from '../../config/constants';
import { createPaginationResult, getSkipValue } from '../../utils/pagination';

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
          error: 'Validation error',
          message: validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      // Check if user can apply as a client
      const canApply = await this.clientService.canUserApplyAsClient(req.user.id);
      
      if (!canApply) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'User cannot apply as a client. Must have INVESTOR role and no existing client profile.'
        });
        return;
      }

      const clientProfile = await this.clientService.applyAsClient(req.user.id, validation.data);

      res.status(201).json({
        success: true,
        data: clientProfile,
        message: 'Client application submitted successfully. Pending approval.'
      });
    } catch (error) {
      logger.error('Error processing client application:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * GET /clients/me
   * Get current user's client profile
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

      // Verify user has CLIENT role
      if (req.user.role !== UserRole.CLIENT) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied. CLIENT role required.'
        });
        return;
      }

      const clientProfile = await this.clientService.getClientByUserId(req.user.id);

      if (!clientProfile) {
        res.status(404).json({
          success: false,
          error: 'Client profile not found',
          message: 'No client profile found for this user'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: clientProfile
      });
    } catch (error) {
      logger.error('Error fetching current client profile:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * PUT /clients/me
   * Update current user's client profile
   */
  updateClientProfile = async (
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
          error: 'Validation error',
          message: validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      // Check if client profile exists
      const existingProfile = await this.clientService.getClientByUserId(req.user.id);

      if (!existingProfile) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Client profile not found for current user'
        });
        return;
      }

      const updatedProfile = await this.clientService.updateClient(existingProfile.id, validation.data);

      if (!updatedProfile) {
        res.status(404).json({
          success: false,
          error: 'Client profile not found',
          message: 'No client profile found for this user'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedProfile,
        message: 'Client profile updated successfully'
      });
    } catch (error) {
      logger.error('Error updating client profile:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Update error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update client profile'
      });
    }
  };

  /**
   * GET /clients/:id
   * Get client profile by ID (Admin only)
   */
  getClientById = async (
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

      // Check if user is admin
      if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only administrators can access this resource'
        });
        return;
      }

      // Validate client ID parameter
      const validation = validateClientIdParam(req.params);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      const clientProfile = await this.clientService.getClientById(validation.data.id);

      if (!clientProfile) {
        res.status(404).json({
          success: false,
          error: 'Client not found',
          message: 'Client profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: clientProfile
      });
    } catch (error) {
      logger.error('Error fetching client profile by ID:', error instanceof Error ? error.message : 'Unknown error');
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch client profile'
      });
    }
  };

  /**
   * GET /clients
   * List all clients (Admin only)
   */
  listClients = async (
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

      // Check if user is admin
      if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only administrators can access this resource'
        });
        return;
      }

      // Validate query parameters
      const validation = validateClientListQuery(req.query);
      
      if (!validation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      const result = await this.clientService.getAllClients(validation.data);

      res.status(200).json({
        success: true,
        data: result.data,
        meta: result.meta
      });
    } catch (error) {
      logger.error('Error listing clients:', error instanceof Error ? error.message : 'Unknown error');
      
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to list clients'
      });
    }
  };

  /**
   * PATCH /clients/:id/status
   * Update client status (Admin only)
   */
  updateClientStatus = async (
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

      // Check if user is admin
      if (req.user.role !== UserRole.ADMIN) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Only administrators can update client status'
        });
        return;
      }

      // Validate client ID parameter
      const idValidation = validateClientIdParam(req.params);
      
      if (!idValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: idValidation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      // Validate request body
      const statusValidation = validateClientStatusUpdate(req.body);
      
      if (!statusValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: statusValidation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      // Check if client exists
      const existingClient = await this.clientService.getClientById(idValidation.data.id);

      if (!existingClient) {
        res.status(404).json({
          success: false,
          error: 'Not found',
          message: 'Client not found'
        });
        return;
      }

      const updatedClient = await this.clientService.updateClientStatus(
        idValidation.data.id,
        statusValidation.data.status
      );

      if (!updatedClient) {
        res.status(404).json({
          success: false,
          error: 'Client not found',
          message: 'Client profile not found'
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: updatedClient,
        message: `Client status updated to ${statusValidation.data.status}`
      });
    } catch (error) {
      logger.error('Error updating client status:', error instanceof Error ? error.message : 'Unknown error');
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Update error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update client status'
      });
    }
  };
}
