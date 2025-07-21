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

/**
 * Controller for client-related operations
 */
export class ClientController {
  private clientService: ClientService;

  constructor(prisma: PrismaClient) {
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
      logger.error('Error processing client application:', error);
      
      if (error instanceof Error) {
        res.status(400).json({
          success: false,
          error: 'Application error',
          message: error.message
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to process client application'
      });
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
      logger.error('Error fetching current client profile:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch client profile'
      });
    }
  };

  /**
   * PATCH /clients/me
   * Update current user's client profile
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

      // Verify user has CLIENT role
      if (req.user.role !== UserRole.CLIENT) {
        res.status(403).json({
          success: false,
          error: 'Forbidden',
          message: 'Access denied. CLIENT role required.'
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

      const updatedProfile = await this.clientService.updateClient(req.user.id, validation.data);

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
      logger.error('Error updating client profile:', error);
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
  getClientProfileById = async (
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

      // Validate client ID parameter
      const paramValidation = validateClientIdParam(req.params);
      
      if (!paramValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid client ID',
          message: 'Client ID must be a valid UUID'
        });
        return;
      }

      const { id } = paramValidation.data;
      const clientProfile = await this.clientService.getClientById(id);

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
      logger.error('Error fetching client profile by ID:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch client profile'
      });
    }
  };

  /**
   * GET /clients
   * Get all clients (Admin only)
   */
  getAllClients = async (
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

      // Validate query parameters
      const queryValidation = validateClientListQuery(req.query);
      
      if (!queryValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          message: queryValidation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      const { limit = 50, offset = 0, status } = queryValidation.data;

      const clients = await this.clientService.getAllClients(limit, offset, status);
      const totalCount = await this.clientService.getClientCount(status);

      res.status(200).json({
        success: true,
        data: clients,
        pagination: {
          limit,
          offset,
          total: totalCount,
          hasMore: offset + limit < totalCount
        }
      });
    } catch (error) {
      logger.error('Error fetching all clients:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to fetch clients'
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

      // Validate client ID parameter
      const paramValidation = validateClientIdParam(req.params);
      
      if (!paramValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid client ID',
          message: 'Client ID must be a valid UUID'
        });
        return;
      }

      // Validate request body
      const bodyValidation = validateClientStatusUpdate(req.body);
      
      if (!bodyValidation.success) {
        res.status(400).json({
          success: false,
          error: 'Validation error',
          message: bodyValidation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        });
        return;
      }

      const { id } = paramValidation.data;
      const { status } = bodyValidation.data;

      const updatedClient = await this.clientService.updateClientStatus(id, status, req.user.id);

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
        message: `Client status updated to ${status} successfully`
      });
    } catch (error) {
      logger.error('Error updating client status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update client status'
      });
    }
  };
}
