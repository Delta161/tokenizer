import { PrismaClient, Notification } from '@prisma/client';
import { CreateNotificationDto, GetNotificationsDto } from '../types/notifications.types';
import { UserPublicDTO } from '../../user/user.types';

/**
 * Service class for handling notification-related operations
 */
export class NotificationService {
  private prisma: PrismaClient;

  /**
   * Creates a new instance of NotificationService
   * @param prisma - The Prisma client instance
   */
  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Sends a notification to a user
   * @param notificationData - The notification data to create
   * @returns The created notification
   */
  async sendNotification(notificationData: CreateNotificationDto): Promise<Notification> {
    // Verify user exists
    const user = await this.prisma.user.findUnique({
      where: { id: notificationData.userId },
    });

    if (!user) {
      throw new Error(`User with ID ${notificationData.userId} not found`);
    }

    // Create the notification
    return this.prisma.notification.create({
      data: {
        userId: notificationData.userId,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        metadata: notificationData.metadata ? JSON.stringify(notificationData.metadata) : null,
      },
    });
  }

  /**
   * Marks a notification as read
   * @param id - The notification ID
   * @param userId - The user ID (for security verification)
   * @returns The updated notification
   */
  async markAsRead(id: string, userId: string): Promise<Notification> {
    // Find the notification and verify it belongs to the user
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!notification) {
      throw new Error(`Notification with ID ${id} not found or does not belong to user ${userId}`);
    }

    // If already read, just return it
    if (notification.isRead) {
      return notification;
    }

    // Mark as read
    return this.prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  /**
   * Gets all notifications for a user
   * @param userId - The user ID
   * @param options - Options for filtering and pagination
   * @returns Array of notifications
   */
  async getAllForUser(userId: string, options?: GetNotificationsDto): Promise<Notification[]> {
    const { limit = 10, offset = 0, includeRead = false } = options || {};

    // Build where clause based on options
    const whereClause: any = {
      userId,
    };

    // Only include unread notifications if specified
    if (!includeRead) {
      whereClause.isRead = false;
    }

    // Get notifications with pagination
    return this.prisma.notification.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc', // Most recent first
      },
      skip: offset,
      take: limit,
    });
  }

  /**
   * Gets the count of unread notifications for a user
   * @param userId - The user ID
   * @returns Count of unread notifications
   */
  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });
  }

  /**
   * Marks all notifications for a user as read
   * @param userId - The user ID
   * @returns Count of updated notifications
   */
  async markAllAsRead(userId: string): Promise<number> {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });

    return result.count;
  }

  /**
   * Sends a broadcast notification to multiple users
   * @param broadcastData - The broadcast notification data
   * @returns Count of created notifications and array of created notification IDs
   */
  async sendBroadcast(broadcastData: {
    adminId: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ count: number; notificationIds: string[] }> {
    // Create notifications for all users in a transaction
    const result = await this.prisma.$transaction(async (tx) => {
      // Get all users except the admin who triggered the broadcast
      const users = await tx.user.findMany({
        where: {
          id: {
            not: broadcastData.adminId, // Exclude the admin who sent the broadcast
          },
        },
        select: {
          id: true,
        },
      });

      const validUserIds = users.map((user) => user.id);

      // Create notifications for valid users
      const createPromises = validUserIds.map((userId) =>
        tx.notification.create({
          data: {
            userId,
            type: broadcastData.type,
            title: broadcastData.title,
            message: broadcastData.message,
            metadata: broadcastData.metadata ? JSON.stringify(broadcastData.metadata) : null,
          },
        })
      );

      return Promise.all(createPromises);
    });

    return {
      count: result.length,
      notificationIds: result.map(notification => notification.id)
    };
  }

  /**
   * Gets user information for notification delivery
   * @param userId - The user ID
   * @returns User information or null if user not found
   */
  async getUserForNotification(userId: string): Promise<UserPublicDTO | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return null;
    }

    return user as UserPublicDTO;
  }
  
  /**
   * Gets a notification by ID
   * @param id - The notification ID
   * @returns The notification or null if not found
   */
  async getNotificationById(id: string): Promise<Notification | null> {
    return this.prisma.notification.findUnique({
      where: { id }
    });
  }
}