import { PrismaClient, Notification, Prisma } from '@prisma/client';
import { NotificationDto, CreateNotificationDto } from './notifications.types';
import { UserPublicDTO } from '../accounts/types/user.types';
import { Logger } from '../../utils/logger';
import { mapNotificationToDto } from './notifications.mapper';

/**
 * Service for managing notifications
 */
export class NotificationService {
  private prisma: PrismaClient;
  private logger: Logger;

  /**
   * Create a new notification service
   * @param prisma - Prisma client instance
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
    this.logger = new Logger('NotificationService');
  }

  /**
   * Send a notification to a user
   * @param userId - ID of the user to notify
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional additional data
   * @returns Created notification as DTO
   */
  async sendNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDto> {
    try {
      // Verify user exists
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true }
      });

      if (!user) {
        throw new Error(`User with ID ${userId} not found`);
      }

      // Create notification
      const notification = await this.prisma.notification.create({
        data: {
          userId,
          type,
          title,
          message,
          metadata: metadata ? JSON.stringify(metadata) : null,
          read: false,
        },
      });

      this.logger.info('Notification created', {
        notificationId: notification.id,
        userId,
        type,
        module: 'notifications',
        eventType: 'notification_created'
      });

      return mapNotificationToDto(notification);
    } catch (error) {
      this.logger.error('Failed to create notification', {
        userId,
        type,
        title,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'notification_creation_failed'
      });
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param notificationId - ID of the notification
   * @param userId - ID of the user who owns the notification
   * @returns Updated notification as DTO
   */
  async markAsRead(notificationId: string, userId: string): Promise<NotificationDto> {
    try {
      const notification = await this.prisma.notification.update({
        where: {
          id: notificationId,
          userId, // Ensure the notification belongs to the user
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      this.logger.info('Notification marked as read', {
        notificationId,
        userId,
        module: 'notifications',
        eventType: 'notification_read'
      });

      return mapNotificationToDto(notification);
    } catch (error) {
      this.logger.error('Failed to mark notification as read', {
        notificationId,
        userId,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'notification_read_failed'
      });
      throw error;
    }
  }

  /**
   * Get all notifications for a user
   * @param userId - ID of the user
   * @param options - Optional filtering and pagination options
   * @returns Array of notification DTOs
   */
  async getAllForUser(
    userId: string,
    options?: {
      read?: boolean;
      type?: string;
      skip?: number;
      take?: number;
    }
  ): Promise<NotificationDto[]> {
    try {
      const { read, type, skip = 0, take = 50 } = options || {};

      // Build where clause
      const where: Prisma.NotificationWhereInput = { userId };

      // Add optional filters
      if (typeof read === 'boolean') {
        where.read = read;
      }

      if (type) {
        where.type = type;
      }

      // Get notifications
      const notifications = await this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      });

      return notifications.map(mapNotificationToDto);
    } catch (error) {
      this.logger.error('Failed to get notifications for user', {
        userId,
        options,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_notifications_failed'
      });
      throw error;
    }
  }

  /**
   * Get count of unread notifications for a user
   * @param userId - ID of the user
   * @returns Count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const count = await this.prisma.notification.count({
        where: {
          userId,
          read: false,
        },
      });

      return count;
    } catch (error) {
      this.logger.error('Failed to get unread notification count', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_unread_count_failed'
      });
      throw error;
    }
  }

  /**
   * Mark all notifications as read for a user
   * @param userId - ID of the user
   * @returns Count of notifications marked as read
   */
  async markAllAsRead(userId: string): Promise<number> {
    try {
      const result = await this.prisma.notification.updateMany({
        where: {
          userId,
          read: false,
        },
        data: {
          read: true,
          readAt: new Date(),
        },
      });

      this.logger.info('All notifications marked as read', {
        userId,
        count: result.count,
        module: 'notifications',
        eventType: 'notifications_read'
      });

      return result.count;
    } catch (error) {
      this.logger.error('Failed to mark all notifications as read', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'mark_all_read_failed'
      });
      throw error;
    }
  }

  /**
   * Send a broadcast notification to multiple users
   * @param userIds - IDs of users to notify
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @param metadata - Optional additional data
   * @returns Array of created notification DTOs
   */
  async sendBroadcast(
    userIds: string[],
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, any>
  ): Promise<NotificationDto[]> {
    try {
      // Verify users exist
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
        },
        select: { id: true },
      });

      const validUserIds = users.map(user => user.id);
      const invalidUserIds = userIds.filter(id => !validUserIds.includes(id));

      if (invalidUserIds.length > 0) {
        this.logger.warn('Some users not found for broadcast', {
          invalidUserIds,
          module: 'notifications',
          eventType: 'broadcast_invalid_users'
        });
      }

      if (validUserIds.length === 0) {
        return [];
      }

      // Create notifications for all valid users
      const metadataString = metadata ? JSON.stringify(metadata) : null;
      const now = new Date();

      const data = validUserIds.map(userId => ({
        userId,
        type,
        title,
        message,
        metadata: metadataString,
        read: false,
        createdAt: now,
        updatedAt: now,
      }));

      // Create notifications in bulk
      const result = await this.prisma.notification.createMany({
        data,
        skipDuplicates: false,
      });

      this.logger.info('Broadcast notifications created', {
        userCount: result.count,
        type,
        module: 'notifications',
        eventType: 'broadcast_created'
      });

      // Fetch the created notifications to return as DTOs
      const createdNotifications = await this.prisma.notification.findMany({
        where: {
          userId: { in: validUserIds },
          type,
          title,
          message,
          createdAt: now
        },
        orderBy: { createdAt: 'desc' }
      });

      return createdNotifications.map(mapNotificationToDto);
    } catch (error) {
      this.logger.error('Failed to create broadcast notifications', {
        userCount: userIds.length,
        type,
        title,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'broadcast_creation_failed'
      });
      throw error;
    }
  }

  /**
   * Get user information for notification delivery
   * @param userId - ID of the user
   * @returns User information or null if not found
   */
  async getUserForNotification(userId: string): Promise<UserPublicDTO | null> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
        },
      });

      if (!user) {
        return null;
      }

      return user as UserPublicDTO;
    } catch (error) {
      this.logger.error('Failed to get user for notification', {
        userId,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_user_failed'
      });
      throw error;
    }
  }

  /**
   * Get a notification by ID
   * @param userId - ID of the user who owns the notification
   * @param type - Notification type
   * @param title - Notification title
   * @param message - Notification message
   * @returns Notification DTO or null if not found
   */
  async getNotificationById(
    userId: string,
    type: string,
    title: string,
    message: string
  ): Promise<NotificationDto | null> {
    try {
      const notification = await this.prisma.notification.findFirst({
        where: {
          userId,
          type,
          title,
          message,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!notification) {
        return null;
      }

      return mapNotificationToDto(notification);
    } catch (error) {
      this.logger.error('Failed to get notification by ID', {
        userId,
        type,
        title,
        error: error instanceof Error ? error.message : String(error),
        module: 'notifications',
        eventType: 'get_notification_failed'
      });
      throw error;
    }
  }
}
