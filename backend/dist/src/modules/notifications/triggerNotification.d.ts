import { PrismaClient } from '@prisma/client';
import { NotificationService } from './notifications.service';
import { NotificationDispatcherService } from './delivery';
import { NotificationConfig } from './notifications.config';
import { CreateNotificationDto, NotificationDto } from './notifications.types';
/**
 * Interface for notification trigger functionality
 */
export interface NotificationTriggerInterface {
    /**
     * Trigger a notification for a single user
     * @param notificationData - Data for the notification
     * @returns The created notification or null if creation failed
     */
    triggerNotification(notificationData: CreateNotificationDto): Promise<NotificationDto | null>;
    /**
     * Trigger a broadcast notification for multiple users
     * @param userIds - IDs of users to send notification to
     * @param notificationData - Data for the notification (without userId)
     * @returns Array of created notifications
     */
    triggerBroadcast(userIds: string[], notificationData: Omit<CreateNotificationDto, 'userId'>): Promise<NotificationDto[]>;
}
/**
 * Class that handles triggering notifications
 * Creates notifications in the database and dispatches them through available channels
 */
export declare class NotificationTrigger implements NotificationTriggerInterface {
    private notificationService;
    private dispatcher;
    private logger;
    /**
     * Create a new notification trigger
     * @param notificationService - Service for creating and managing notifications
     * @param dispatcher - Service for dispatching notifications to channels
     */
    constructor(notificationService: NotificationService, dispatcher: NotificationDispatcherService);
    /**
     * Trigger a notification for a single user
     * @param notificationData - Data for the notification
     * @returns The created notification or null if creation failed
     */
    triggerNotification(notificationData: CreateNotificationDto): Promise<NotificationDto | null>;
    /**
     * Trigger a broadcast notification for multiple users
     * @param userIds - IDs of users to send notification to
     * @param notificationData - Data for the notification (without userId)
     * @returns Array of created notifications
     */
    triggerBroadcast(userIds: string[], notificationData: Omit<CreateNotificationDto, 'userId'>): Promise<NotificationDto[]>;
}
/**
 * Create a notification trigger with the given configuration
 * @param prisma - Prisma client instance
 * @param config - Notification configuration
 * @returns Initialized notification trigger
 */
export declare const createNotificationTrigger: (prisma: PrismaClient, config: NotificationConfig) => NotificationTriggerInterface;
//# sourceMappingURL=triggerNotification.d.ts.map