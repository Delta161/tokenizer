import { Request, Response } from 'express';
import { NotificationService } from './notifications.service';
import { validateNotificationBroadcast } from './notifications.validators';
import { Logger } from '../../utils/logger';

/**
 * Controller for notification-related API endpoints
 */
export class NotificationController {
  private notificationService: NotificationService;
  private logger: Logger;

  /**
   * Create a new notification controller
   * @param notificationService - Service for managing notifications
   */
  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
    this.logger = new Logger('NotificationController');
  }

  /**
   * Get all notifications for the authenticated user
   * @param req - Express request
   * @param res - Express response
   */
  getMyNotifications = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const userId = req.user.id;
      
      // Parse query parameters
      const read = req.query.read !== undefined 
        ? req.query.read === 'true' 
        : undefined;
      
      const type = req.query.type as string | undefined;
      
      const skip = req.query.skip !== undefined 
        ? parseInt(req.query.skip as string, 10) 
        : undefined;
      
      const take = req.query.take !== undefined 
        ? parseInt(req.query.take as string, 10) 
        : undefined;

      // Get notifications
      const notifications = await this.notificationService.getAllForUser(
        userId,
        { read, type, skip, take }
      );

      res.status(200).json({
        success: true,
        data: notifications,
      });
    } catch (error) {
      this.logger.error('Error getting notifications', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_notifications_error'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get notifications',
      });
    }
  };

  /**
   * Get count of unread notifications for the authenticated user
   * @param req - Express request
   * @param res - Express response
   */
  getUnreadCount = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const userId = req.user.id;

      // Get unread count
      const count = await this.notificationService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      this.logger.error('Error getting unread count', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_unread_count_error'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to get unread notification count',
      });
    }
  };

  /**
   * Mark a notification as read
   * @param req - Express request
   * @param res - Express response
   */
  markAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const userId = req.user.id;
      const notificationId = req.params.id;

      if (!notificationId) {
        res.status(400).json({
          success: false,
          error: 'Notification ID is required',
        });
        return;
      }

      // Mark notification as read
      const notification = await this.notificationService.markAsRead(
        notificationId,
        userId
      );

      res.status(200).json({
        success: true,
        data: notification,
      });
    } catch (error) {
      this.logger.error('Error marking notification as read', {
        userId: req.user?.id,
        notificationId: req.params.id,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'mark_notification_read_error'
      });

      // Handle not found error
      if (error instanceof Error && error.message.includes('Record to update not found')) {
        res.status(404).json({
          success: false,
          error: 'Notification not found',
        });
        return;
      }

      res.status(500).json({
        success: false,
        error: 'Failed to mark notification as read',
      });
    }
  };

  /**
   * Mark all notifications as read for the authenticated user
   * @param req - Express request
   * @param res - Express response
   */
  markAllAsRead = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      const userId = req.user.id;

      // Mark all notifications as read
      const count = await this.notificationService.markAllAsRead(userId);

      res.status(200).json({
        success: true,
        data: { count },
      });
    } catch (error) {
      this.logger.error('Error marking all notifications as read', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'mark_all_read_error'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to mark all notifications as read',
      });
    }
  };

  /**
   * Send a broadcast notification to multiple users
   * @param req - Express request
   * @param res - Express response
   */
  sendBroadcast = async (req: Request, res: Response): Promise<void> => {
    try {
      // Ensure user is authenticated and is an admin
      if (!req.user || !req.user.id) {
        res.status(401).json({
          success: false,
          error: 'Unauthorized',
        });
        return;
      }

      // Validate request body
      const validationResult = validateNotificationBroadcast(req.body);
      if (!validationResult.success) {
        res.status(400).json({
          success: false,
          error: 'Invalid request data',
          details: validationResult.error.errors,
        });
        return;
      }

      const { userIds, type, title, message, metadata } = validationResult.data;

      // Send broadcast
      const notifications = await this.notificationService.sendBroadcast(
        userIds,
        type,
        title,
        message,
        metadata
      );

      res.status(200).json({
        success: true,
        data: { notifications, count: notifications.length },
        message: `Sent ${notifications.length} notifications`,
      });
    } catch (error) {
      this.logger.error('Error sending broadcast notification', {
        userId: req.user?.id,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'broadcast_notification_error'
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send broadcast notification',
      });
    }
  };
}