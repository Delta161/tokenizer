import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * Socket notification channel
 * This is a stub implementation for future real-time socket delivery
 */
export declare class SocketNotificationChannel extends BaseNotificationChannel {
    /**
     * Channel identifier
     */
    readonly channelId: string;
    /**
     * Send a notification through the socket channel
     * Currently just logs that it would send via socket (stub implementation)
     * @param user - User to send notification to
     * @param notification - Notification to send
     */
    send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Check if this channel is available for the given user
     * Socket notifications would be available if the user has active socket connections
     * @returns Currently always false as socket delivery is not implemented
     */
    isAvailableFor(): boolean;
    /**
     * Format socket payload from notification
     * @param notification - Notification to format
     * @returns Socket event payload
     */
    protected formatSocketPayload(notification: NotificationDto): Record<string, unknown>;
}
//# sourceMappingURL=socket.channel.d.ts.map