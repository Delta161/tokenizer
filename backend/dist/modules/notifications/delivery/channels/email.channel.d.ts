import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * Email notification channel
 * This is a stub implementation for future email delivery
 */
export declare class EmailNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    readonly channelId: string;
    /**
     * Send a notification through the email channel
     * Currently just logs that it would send an email (stub implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user
     * Email notifications are available if the user has an email address
     * @param user - User to check
     * @returns True if user has an email address
     */
    isAvailableFor(user: UserPublicDTO): boolean;
    /**
     * Format email subject from notification title
     * @param notification - Notification to format
     * @returns Formatted email subject
     */
    protected formatTitle(notification: NotificationDto): string;
}
//# sourceMappingURL=email.channel.d.ts.map