import { NotificationChannel, NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { Logger } from '../../../../utils/logger';
/**
 * Abstract base class for notification channels
 * Provides common functionality for all channel implementations
 */
export declare abstract class BaseNotificationChannel implements NotificationChannel {
    protected logger: Logger;
    /**
     * Channel identifier
     */
    abstract readonly channelId: string;
    constructor();
    /**
     * Send a notification through this channel
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    abstract send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user and notification
     * Default implementation returns true
     * Override in subclasses to implement specific availability logic
     * @param user - User to check
     * @param notification - Notification to check
     * @returns True if channel is available
     */
    isAvailableFor(user: UserPublicDTO, notification?: NotificationDto): boolean;
    /**
     * Format notification title for delivery
     * @param notification - Notification to format
     * @returns Formatted title
     */
    formatTitle(notification: NotificationDto): string;
    /**
     * Format notification message for delivery
     * @param notification - Notification to format
     * @returns Formatted message
     */
    formatMessage(notification: NotificationDto): string;
    /**
     * Log a delivery attempt
     * @param user - User the notification is being sent to
     * @param notification - The notification being sent
     * @param success - Whether the delivery was successful
     * @param error - Error message if delivery failed
     */
    protected logDeliveryAttempt(user: UserPublicDTO, notification: NotificationDto, success: boolean, error?: string): void;
}
//# sourceMappingURL=base.channel.d.ts.map