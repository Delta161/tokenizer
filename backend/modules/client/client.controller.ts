import { Response, NextFunction } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';
import { AuthenticatedRequest } from '../auth/requireAuth.js';
import { ClientService } from './client.service.js';
import {
  ClientApplicationDTO,
  ClientUpdateDTO,
  ClientStatusUpdateDTO,
  ClientProfileResponse,
  ClientListResponse,
  ClientApplicationResponse,
  ClientUpdateResponse,
  ClientStatusUpdateResponse,
  ErrorResponse,
  ClientIdParams,
  ClientListQuery
} from './client.types.js';
import {
  validateClientApplication,
  validateClientUpdate,
  validateClientStatusUpdate,
  validateClientIdParam,
  validateClientListQuery
} from './validators/clientSchema.js';

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
    res: Response<ClientApplicationResponse | ErrorResponse>,
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

      const applicationData: ClientApplicationDTO = validation.data;

      // Check if user can apply as client
      const canApply = await this.clientService.canUserApplyAsClient(req.user.id);
      
      if (!canApply) {
        res.status(400).json({
          success: false,
          error: 'Application not allowed',
          message: 'User already has a client profile or does not have the required role'
        });
        return;
      }

      const clientProfile = await this.clientService.applyAsClient(req.user.id, applicationData);

      if (!clientProfile) {
        res.status(500).json({
          success: false,
          error: 'Application failed',
          message: 'Failed to create client profile'
        });
        return;
      }

      res.status(201).json({
        success: true,
        data: clientProfile,
        message: 'Client application submitted successfully. Your application is pending review.'
      });
    } catch (error) {
      console.error('Error in client application:', error);
      
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
    res: Response<ClientProfileResponse | ErrorResponse>,
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
      console.error('Error fetching current client profile:', error);
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
    res: Response<ClientUpdateResponse | ErrorResponse>,
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

      const updateData: ClientUpdateDTO = validation.data;

      const updatedProfile = await this.clientService.updateClient(req.user.id, updateData);

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
      console.error('Error updating client profile:', error);
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
    res: Response<ClientProfileResponse | ErrorResponse>,
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
      console.error('Error fetching client profile by ID:', error);
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
    res: Response<ClientListResponse | ErrorResponse>,
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
      console.error('Error fetching all clients:', error);
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
    res: Response<ClientStatusUpdateResponse | ErrorResponse>,
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

      const updatedClient = await this.clientService.updateClientStatus(id, status);

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
      console.error('Error updating client status:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: 'Failed to update client status'
      });
    }
  };
}