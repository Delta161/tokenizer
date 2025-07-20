import { PrismaClient } from '@prisma/client';
import { NotificationDto } from './notifications.types';
import { UserPublicDTO } from '../accounts/types/user.types';
/**
 * Service for managing notifications
 */
export declare class NotificationService {
    private prisma;
    private logger;
    /**
     * Create a new notification service
     * @param prisma - Prisma client instance
     */
    constructor(prisma: PrismaClient);
    /**
     * Send a notification to a user
     * @param userId - ID of the user to notify
     * @param type - Notification type
     * @param title - Notification title
     * @param message - Notification message
     * @param metadata - Optional additional data
     * @returns Created notification as DTO
     */
    sendNotification(userId: string, type: string, title: string, message: string, metadata?: Record<string, any>): Promise<NotificationDto>;
    /**
     * Mark a notification as read
     * @param notificationId - ID of the notification
     * @param userId - ID of the user who owns the notification
     * @returns Updated notification as DTO
     */
    markAsRead(notificationId: string, userId: string): Promise<NotificationDto>;
    /**
     * Get all notifications for a user
     * @param userId - ID of the user
     * @param options - Optional filtering and pagination options
     * @returns Array of notification DTOs
     */
    getAllForUser(userId: string, options?: {
        read?: boolean;
        type?: string;
        skip?: number;
        take?: number;
    }): Promise<NotificationDto[]>;
    /**
     * Get count of unread notifications for a user
     * @param userId - ID of the user
     * @returns Count of unread notifications
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Mark all notifications as read for a user
     * @param userId - ID of the user
     * @returns Count of notifications marked as read
     */
    markAllAsRead(userId: string): Promise<number>;
    /**
     * Send a broadcast notification to multiple users
     * @param userIds - IDs of users to notify
     * @param type - Notification type
     * @param title - Notification title
     * @param message - Notification message
     * @param metadata - Optional additional data
     * @returns Array of created notification DTOs
     */
    sendBroadcast(userIds: string[], type: string, title: string, message: string, metadata?: Record<string, any>): Promise<NotificationDto[]>;
    /**
     * Get user information for notification delivery
     * @param userId - ID of the user
     * @returns User information or null if not found
     */
    getUserForNotification(userId: string): Promise<UserPublicDTO | null>;
    /**
     * Get a notification by ID
     * @param userId - ID of the user who owns the notification
     * @param type - Notification type
     * @param title - Notification title
     * @param message - Notification message
     * @returns Notification DTO or null if not found
     */
    getNotificationById(userId: string, type: string, title: string, message: string): Promise<NotificationDto | null>;
}
//# sourceMappingURL=notifications.service.d.ts.map