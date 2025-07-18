import { PrismaClient, Notification } from '@prisma/client';
import { CreateNotificationDto, GetNotificationsDto } from '../types/notifications.types';
import { UserPublicDTO } from '../../user/user.types';
/**
 * Service class for handling notification-related operations
 */
export declare class NotificationService {
    private prisma;
    /**
     * Creates a new instance of NotificationService
     * @param prisma - The Prisma client instance
     */
    constructor(prisma: PrismaClient);
    /**
     * Sends a notification to a user
     * @param notificationData - The notification data to create
     * @returns The created notification
     */
    sendNotification(notificationData: CreateNotificationDto): Promise<Notification>;
    /**
     * Marks a notification as read
     * @param id - The notification ID
     * @param userId - The user ID (for security verification)
     * @returns The updated notification
     */
    markAsRead(id: string, userId: string): Promise<Notification>;
    /**
     * Gets all notifications for a user
     * @param userId - The user ID
     * @param options - Options for filtering and pagination
     * @returns Array of notifications
     */
    getAllForUser(userId: string, options?: GetNotificationsDto): Promise<Notification[]>;
    /**
     * Gets the count of unread notifications for a user
     * @param userId - The user ID
     * @returns Count of unread notifications
     */
    getUnreadCount(userId: string): Promise<number>;
    /**
     * Marks all notifications for a user as read
     * @param userId - The user ID
     * @returns Count of updated notifications
     */
    markAllAsRead(userId: string): Promise<number>;
    /**
     * Sends a broadcast notification to multiple users
     * @param broadcastData - The broadcast notification data
     * @returns Count of created notifications and array of created notification IDs
     */
    sendBroadcast(broadcastData: {
        adminId: string;
        type: string;
        title: string;
        message: string;
        metadata?: Record<string, unknown>;
    }): Promise<{
        count: number;
        notificationIds: string[];
    }>;
    /**
     * Gets user information for notification delivery
     * @param userId - The user ID
     * @returns User information or null if user not found
     */
    getUserForNotification(userId: string): Promise<UserPublicDTO | null>;
    /**
     * Gets a notification by ID
     * @param id - The notification ID
     * @returns The notification or null if not found
     */
    getNotificationById(id: string): Promise<Notification | null>;
}
//# sourceMappingURL=notifications.service.d.ts.map