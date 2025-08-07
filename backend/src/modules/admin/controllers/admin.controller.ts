import { Request, Response } from 'express';
import { AdminService } from '../services/admin.service.js';
import { adminLogger } from '../utils/admin.logger.js';
import { 
  updateUserRoleSchema, 
  updateUserStatusSchema, 
  moderatePropertySchema,
  adminNotificationSchema
} from '../validators/admin.validator.js';

export class AdminController {
  private adminService: AdminService;

  constructor(adminService: AdminService) {
    this.adminService = adminService;
  }

  /**
   * Get users with optional filtering
   */
  getUsers = async (req: Request, res: Response) => {
    try {
      const { page, limit, role, isActive, search } = req.query;
      
      const users = await this.adminService.getUsers({
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        role: role as string,
        isActive: isActive ? (isActive === 'true') : undefined,
        search: search as string
      });
      
      adminLogger.info('Admin retrieved users list');
      return res.status(200).json(users);
    } catch (error: any) {
      adminLogger.error('Error getting users', { error: error.message });
      return res.status(500).json({ error: 'Failed to get users' });
    }
  };

  /**
   * Update user role
   */
  updateUserRole = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;
      
      const validatedData = updateUserRoleSchema.parse(req.body);
      
      const updatedUser = await this.adminService.updateUserRole(userId, validatedData.role, adminId);
      
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      adminLogger.error('Error updating user role', { error: error.message });
      return res.status(500).json({ error: 'Failed to update user role' });
    }
  };

  /**
   * Update user active status
   */
  updateUserStatus = async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const adminId = req.user?.id;
      
      const validatedData = updateUserStatusSchema.parse(req.body);
      
      const updatedUser = await this.adminService.updateUserStatus(userId, validatedData.isActive, adminId);
      
      return res.status(200).json(updatedUser);
    } catch (error: any) {
      adminLogger.error('Error updating user status', { error: error.message });
      return res.status(500).json({ error: 'Failed to update user status' });
    }
  };

  /**
   * Moderate property
   */
  moderateProperty = async (req: Request, res: Response) => {
    try {
      const { propertyId } = req.params;
      const adminId = req.user?.id;
      
      const validatedData = moderatePropertySchema.parse(req.body);
      
      const updatedProperty = await this.adminService.moderateProperty(
        propertyId, 
        validatedData.status, 
        validatedData.comment,
        adminId
      );
      
      return res.status(200).json(updatedProperty);
    } catch (error: any) {
      adminLogger.error('Error moderating property', { error: error.message });
      return res.status(500).json({ error: 'Failed to moderate property' });
    }
  };

  /**
   * Send broadcast notification
   */
  sendBroadcastNotification = async (req: Request, res: Response) => {
    try {
      const adminId = req.user?.id;
      
      const validatedData = adminNotificationSchema.parse(req.body);
      
      await this.adminService.sendBroadcastNotification(
        validatedData.title,
        validatedData.message,
        validatedData.userRole ?? null,
        adminId
      );
      
      return res.status(200).json({ success: true, message: 'Notification sent successfully' });
    } catch (error: any) {
      adminLogger.error('Error sending broadcast notification', { error: error.message });
      return res.status(500).json({ error: 'Failed to send notification' });
    }
  };
}

// Temporary singleton - will be replaced with proper dependency injection
// This is just for backward compatibility
export const adminController: AdminController = null as any;