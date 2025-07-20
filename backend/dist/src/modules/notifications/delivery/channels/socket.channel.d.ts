import { NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
/**
 * Socket notification channel
 * This is a stub implementation for future socket-based delivery
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
     * Socket notifications are currently disabled
     * @returns Always false as socket delivery is not implemented
     */
    isAvailableFor(): boolean;
}
//# sourceMappingURL=socket.channel.d.ts.map