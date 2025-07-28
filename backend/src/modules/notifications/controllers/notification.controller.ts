import { Request, Response } from 'express';
import { NotificationService } from '../services/notification.service';
import { validateNotificationBroadcast } from '../validators/notification.validators';
import { logger } from '@utils/logger';

/**
 * Controller for notification-related API endpoints
 */
export class NotificationController {
  private notificationService: NotificationService;
  private readonly module = 'NotificationController';

  /**
   * Create a new notification controller
   * @param notificationService - Service for managing notifications
   */
  constructor(notificationService: NotificationService) {
    this.notificationService = notificationService;
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
      const notifications = await this.notificationService.getUserNotifications(
        userId,
        { read, type, skip, take }
      );

      // Return response
      res.status(200).json({
        success: true,
        data: {
          notifications,
        },
      });
    } catch (error) {
      logger.error('Error getting user notifications', {
        error: error instanceof Error ? error.message : String(error),
        module: this.module,
        method: 'getMyNotifications',
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve notifications',
      });
    }
  };

  /**
   * Get unread notification count for the authenticated user
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

      // Return response
      res.status(200).json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error) {
      logger.error('Error getting unread notification count', {
        error: error instanceof Error ? error.message : String(error),
        module: this.module,
        method: 'getUnreadCount',
      });

      res.status(500).json({
        success: false,
        error: 'Failed to retrieve unread notification count',
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

      // Mark notification as read
      const notification = await this.notificationService.markAsRead(notificationId, userId);

      if (!notification) {
        res.status(404).json({
          success: false,
          error: 'Notification not found or not owned by user',
        });
        return;
      }

      // Return response
      res.status(200).json({
        success: true,
        data: {
          notification,
        },
      });
    } catch (error) {
      logger.error('Error marking notification as read', {
        error: error instanceof Error ? error.message : String(error),
        module: this.module,
        method: 'markAsRead',
      });

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

      // Return response
      res.status(200).json({
        success: true,
        data: {
          count,
        },
      });
    } catch (error) {
      logger.error('Error marking all notifications as read', {
        error: error instanceof Error ? error.message : String(error),
        module: this.module,
        method: 'markAllAsRead',
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

      // Send broadcast notification
      const notifications = await this.notificationService.sendBroadcastNotification(
        userIds,
        type,
        title,
        message,
        metadata
      );

      // Return response
      res.status(201).json({
        success: true,
        data: {
          count: notifications.length,
          notifications,
        },
      });
    } catch (error) {
      logger.error('Error sending broadcast notification', {
        error: error instanceof Error ? error.message : String(error),
        module: this.module,
        method: 'sendBroadcast',
      });

      res.status(500).json({
        success: false,
        error: 'Failed to send broadcast notification',
      });
    }
  };
}