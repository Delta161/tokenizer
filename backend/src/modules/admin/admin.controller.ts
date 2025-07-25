import { Request, Response, NextFunction } from 'express';
import { AdminService } from './admin.service.js';
import { adminLogger } from './admin.logger';
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  moderatePropertySchema,
  adminNotificationSchema,
  userListQuerySchema,
  propertyListQuerySchema,
  tokenListQuerySchema,
  kycListQuerySchema,
} from './admin.validators.js';
import { AuthenticatedRequest } from '../accounts/types/auth.types.js';

export class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  /**
   * Get all users with optional filtering
   */
  getUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = userListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { role, email, registrationDateFrom, registrationDateTo, page, limit, sortBy, sortOrder } = parseResult.data;
      
      const filters: any = { page, limit, sortBy, sortOrder };
      
      if (role) filters.role = role;
      if (email) filters.email = email;
      if (registrationDateFrom) filters.registrationDateFrom = new Date(registrationDateFrom);
      if (registrationDateTo) filters.registrationDateTo = new Date(registrationDateTo);

      const result = await this.adminService.getUsers(filters);
      
      return res.json(result);
    } catch (error) {
      adminLogger.error('Error getting users', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve users',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const user = await this.adminService.getUserById(userId);
      
      return res.json(user);
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update user role
   */
  updateUserRole = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const parseResult = updateUserRoleSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: parseResult.error.format(),
        });
      }

      const adminId = req.user!.id;
      const updatedUser = await this.adminService.updateUserRole(userId, parseResult.data, adminId);
      
      adminLogger.userRoleUpdate({
        userId,
        oldRole: req.body.oldRole || 'unknown',
        newRole: parseResult.data.role,
        adminId,
      });
      
      return res.json(updatedUser);
    } catch (error) {
      // Log the error before passing it to the error handler
      adminLogger.error('Error updating user role', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        adminId: req.user?.id,
      });
      
      next(error);
    }
  };

  /**
   * Update user active status
   */
  updateUserStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const parseResult = updateUserStatusSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: parseResult.error.format(),
        });
      }

      const adminId = req.user!.id;
      const updatedUser = await this.adminService.updateUserStatus(userId, parseResult.data, adminId);
      
      adminLogger.userStatusUpdate({
        userId,
        oldStatus: req.body.oldStatus || false,
        newStatus: parseResult.data.isActive,
        adminId,
      });
      
      return res.json(updatedUser);
    } catch (error) {
      // Log the error before passing it to the error handler
      adminLogger.error('Error updating user status', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: req.params.userId,
        adminId: req.user?.id,
      });
      
      next(error);
    }
  };

  /**
   * Get all properties with optional filtering
   */
  getProperties = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = propertyListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { status, page, limit, sortBy, sortOrder } = parseResult.data;
      
      const filters: any = { page, limit, sortBy, sortOrder };
      if (status) filters.status = status;

      const result = await this.adminService.getProperties(filters);
      
      return res.json(result);
    } catch (error) {
      adminLogger.error('Error getting properties', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve properties',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get property by ID
   */
  getPropertyById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { propertyId } = req.params;
      const property = await this.adminService.getPropertyById(propertyId);
      
      return res.json(property);
    } catch (error) {
      adminLogger.error('Error getting property', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        propertyId: req.params.propertyId 
      });
      next(error);
    }
  };

  /**
   * Moderate a property (approve/reject)
   */
  moderateProperty = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { propertyId } = req.params;
      const parseResult = moderatePropertySchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: parseResult.error.format(),
        });
      }

      const adminId = req.user!.id;
      const updatedProperty = await this.adminService.moderateProperty(propertyId, parseResult.data, adminId);
      
      adminLogger.propertyModeration({
        propertyId,
        status: parseResult.data.status,
        comment: parseResult.data.comment,
        adminId,
      });
      
      return res.json(updatedProperty);
    } catch (error) {
      adminLogger.error('Error moderating property', {
        error: error instanceof Error ? error.message : 'Unknown error',
        propertyId: req.params.propertyId,
        adminId: req.user?.id,
      });
      
      next(error);
    }
  };

  /**
   * Get all tokens with optional filtering
   */
  getTokens = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = tokenListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { symbol, chainId, propertyId, page, limit, sortBy, sortOrder } = parseResult.data;
      
      const filters: any = { page, limit, sortBy, sortOrder };
      if (symbol) filters.symbol = symbol;
      if (chainId) filters.chainId = chainId; // Already transformed to number in validator
      if (propertyId) filters.propertyId = propertyId;

      const result = await this.adminService.getTokens(filters);
      
      return res.json(result);
    } catch (error) {
      adminLogger.error('Error getting tokens', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve tokens',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get token by ID
   */
  getTokenById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { tokenId } = req.params;
      const token = await this.adminService.getTokenById(tokenId);
      
      adminLogger.tokenInspection({
        tokenId,
        adminId: (req as AuthenticatedRequest).user?.id || 'unknown',
      });
      
      return res.json(token);
    } catch (error) {
      adminLogger.error('Error getting token', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        tokenId: req.params.tokenId 
      });
      next(error);
    }
  };

  /**
   * Get all KYC records with optional filtering
   */
  getKycRecords = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parseResult = kycListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          success: false,
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { status, userId, page, limit, sortBy, sortOrder } = parseResult.data;
      
      const filters: any = { page, limit, sortBy, sortOrder };
      if (status) filters.status = status;
      if (userId) filters.userId = userId;

      const result = await this.adminService.getKycRecords(filters);
      
      return res.json(result);
    } catch (error) {
      adminLogger.error('Error getting KYC records', { 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
      
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve KYC records',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };

  /**
   * Get KYC record by ID
   */
  getKycRecordById = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { kycId } = req.params;
      const kycRecord = await this.adminService.getKycRecordById(kycId);
      
      adminLogger.kycRecordView({
        kycId,
        adminId: req.user!.id,
      });
      
      return res.json(kycRecord);
    } catch (error) {
      adminLogger.error('Error getting KYC record', { 
        error: error instanceof Error ? error.message : 'Unknown error', 
        kycId: req.params.kycId 
      });
      next(error);
    }
  };

  /**
   * Send broadcast notification to users
   */
  sendBroadcastNotification = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parseResult = adminNotificationSchema.safeParse(req.body);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid request body',
          details: parseResult.error.format(),
        });
      }

      const adminId = req.user!.id;
      const result = await this.adminService.sendBroadcastNotification(parseResult.data, adminId);
      
      adminLogger.broadcastNotification({
        title: parseResult.data.title,
        targetRoles: parseResult.data.targetRoles.join(', '),
        recipientCount: result.recipientCount,
        adminId,
      });
      
      return res.json(result);
    } catch (error) {
      adminLogger.error('Error sending broadcast notification', {
        error: error instanceof Error ? error.message : 'Unknown error',
        adminId: req.user?.id,
      });
      
      next(error);
    }
  };
}