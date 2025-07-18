import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * In-app notification channel
 * This channel is used for delivering notifications within the application
 * Currently, it only logs the notification delivery (no-op implementation)
 */
export declare class InAppNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    readonly channelId: string;
    /**
     * Send a notification through the in-app channel
     * Currently just logs the notification (no-op implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user and notification
     * In-app notifications are always available
     * @returns Always true
     */
    isAvailableFor(): boolean;
}
//# sourceMappingURL=inApp.channel.d.ts.map