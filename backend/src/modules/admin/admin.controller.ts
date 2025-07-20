import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { adminLogger } from './admin.logger.js';
import {
  updateUserRoleSchema,
  updateUserStatusSchema,
  moderatePropertySchema,
  adminNotificationSchema,
  userListQuerySchema,
  propertyListQuerySchema,
  tokenListQuerySchema,
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
  getUsers = async (req: Request, res: Response) => {
    try {
      const parseResult = userListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { role, email, registrationDateFrom, registrationDateTo, limit, offset } = parseResult.data;
      
      const filters: any = { limit, offset };
      
      if (role) filters.role = role;
      if (email) filters.email = email;
      if (registrationDateFrom) filters.registrationDateFrom = new Date(registrationDateFrom);
      if (registrationDateTo) filters.registrationDateTo = new Date(registrationDateTo);

      const result = await this.adminService.getUsers(filters);
      
      return res.json(result);
    } catch (error: any) {
      adminLogger.error('Error getting users', { error: error.message });
      return res.status(500).json({ error: 'Failed to get users' });
    }
  };

  /**
   * Get user by ID
   */
  getUserById = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const user = await this.adminService.getUserById(userId);
      
      return res.json(user);
    } catch (error: any) {
      adminLogger.error('Error getting user', { error: error.message, userId: req.params.userId });
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get user' });
    }
  };

  /**
   * Update user role
   */
  updateUserRole = async (req: AuthenticatedRequest, res: Response) => {
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
    } catch (error: any) {
      adminLogger.error('Error updating user role', {
        error: error.message,
        userId: req.params.userId,
        adminId: req.user?.id,
      });
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  };

  /**
   * Update user active status
   */
  updateUserStatus = async (req: AuthenticatedRequest, res: Response) => {
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
    } catch (error: any) {
      adminLogger.error('Error updating user status', {
        error: error.message,
        userId: req.params.userId,
        adminId: req.user?.id,
      });
      
      if (error.message === 'User not found') {
        return res.status(404).json({ error: 'User not found' });
      }
      
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  };

  /**
   * Get all properties with optional filtering
   */
  getProperties = async (req: Request, res: Response) => {
    try {
      const parseResult = propertyListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { status, limit, offset } = parseResult.data;
      
      const filters: any = { limit, offset };
      if (status) filters.status = status;

      const result = await this.adminService.getProperties(filters);
      
      return res.json(result);
    } catch (error: any) {
      adminLogger.error('Error getting properties', { error: error.message });
      return res.status(500).json({ error: 'Failed to get properties' });
    }
  };

  /**
   * Get property by ID
   */
  getPropertyById = async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const property = await this.adminService.getPropertyById(propertyId);
      
      return res.json(property);
    } catch (error: any) {
      adminLogger.error('Error getting property', { error: error.message, propertyId: req.params.propertyId });
      
      if (error.message === 'Property not found') {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get property' });
    }
  };

  /**
   * Moderate a property (approve/reject)
   */
  moderateProperty = async (req: AuthenticatedRequest, res: Response) => {
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
    } catch (error: any) {
      adminLogger.error('Error moderating property', {
        error: error.message,
        propertyId: req.params.propertyId,
        adminId: req.user?.id,
      });
      
      if (error.message === 'Property not found') {
        return res.status(404).json({ error: 'Property not found' });
      }
      
      if (error.message === 'Property is not in SUBMITTED status') {
        return res.status(400).json({ error: 'Property is not in SUBMITTED status' });
      }
      
      return res.status(500).json({ error: 'Failed to moderate property' });
    }
  };

  /**
   * Get all tokens with optional filtering
   */
  getTokens = async (req: Request, res: Response) => {
    try {
      const parseResult = tokenListQuerySchema.safeParse(req.query);
      
      if (!parseResult.success) {
        return res.status(400).json({
          error: 'Invalid query parameters',
          details: parseResult.error.format(),
        });
      }

      const { symbol, chainId, propertyId, limit, offset } = parseResult.data;
      
      const filters: any = { limit, offset };
      if (symbol) filters.symbol = symbol;
      if (chainId) filters.chainId = parseInt(chainId, 10);
      if (propertyId) filters.propertyId = propertyId;

      const result = await this.adminService.getTokens(filters);
      
      return res.json(result);
    } catch (error: any) {
      adminLogger.error('Error getting tokens', { error: error.message });
      return res.status(500).json({ error: 'Failed to get tokens' });
    }
  };

  /**
   * Get token by ID
   */
  getTokenById = async (req: Request, res: Response) => {
    try {
      const { tokenId } = req.params;
      const token = await this.adminService.getTokenById(tokenId);
      
      adminLogger.tokenInspection({
        tokenId,
        adminId: (req as AuthenticatedRequest).user?.id || 'unknown',
      });
      
      return res.json(token);
    } catch (error: any) {
      adminLogger.error('Error getting token', { error: error.message, tokenId: req.params.tokenId });
      
      if (error.message === 'Token not found') {
        return res.status(404).json({ error: 'Token not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get token' });
    }
  };

  /**
   * Get all KYC records with optional filtering
   */
  getKycRecords = async (req: Request, res: Response) => {
    try {
      // TODO: Add KYC list query schema validation
      const result = await this.adminService.getKycRecords(req.query);
      return res.json(result);
    } catch (error: any) {
      adminLogger.error('Error getting KYC records', { error: error.message });
      return res.status(500).json({ error: 'Failed to get KYC records' });
    }
  };

  /**
   * Get KYC record by ID
   */
  getKycRecordById = async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { kycId } = req.params;
      const kycRecord = await this.adminService.getKycRecordById(kycId);
      
      adminLogger.kycRecordView({
        kycId,
        adminId: req.user!.id,
      });
      
      return res.json(kycRecord);
    } catch (error: any) {
      adminLogger.error('Error getting KYC record', { error: error.message, kycId: req.params.kycId });
      
      if (error.message === 'KYC record not found') {
        return res.status(404).json({ error: 'KYC record not found' });
      }
      
      return res.status(500).json({ error: 'Failed to get KYC record' });
    }
  };

  /**
   * Send broadcast notification to users
   */
  sendBroadcastNotification = async (req: AuthenticatedRequest, res: Response) => {
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
    } catch (error: any) {
      adminLogger.error('Error sending broadcast notification', {
        error: error.message,
        adminId: req.user?.id,
      });
      
      return res.status(500).json({ error: 'Failed to send broadcast notification' });
    }
  };
}