import { NotificationDto } from '../types/notifications.types';
import { UserPublicDTO } from '../../user/user.types';
import { NotificationChannel } from './channels';
import { NotificationConfig } from '../config/notification.config';
/**
 * Service responsible for dispatching notifications to various delivery channels
 */
export declare class NotificationDispatcherService {
    private channels;
    private config;
    /**
     * Create a new NotificationDispatcherService
     * Initializes with all available notification channels
     * @param config - Optional configuration for the notification system
     */
    constructor(config?: Partial<NotificationConfig>);
    /**
     * Dispatch a notification to all available channels for the user
     * @param user - User to dispatch notification to
     * @param notification - Notification to dispatch
     * @returns Promise resolving when all dispatches are complete
     */
    dispatchNotification(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
    /**
     * Dispatch a notification to a specific channel
     * @param channel - Channel to dispatch to
     * @param user - User to dispatch notification to
     * @param notification - Notification to dispatch
     * @returns Promise resolving when dispatch is complete
     */
    private dispatchToChannel;
    /**
     * Register a new notification channel
     * @param channel - Channel to register
     * @param enabled - Whether the channel should be enabled (defaults to true)
     */
    registerChannel(channel: NotificationChannel, enabled?: boolean): void;
    /**
     * Get the configuration for a specific channel
     * @param channelId - ID of the channel to get configuration for
     * @returns Channel configuration or undefined if not found
     */
    private getChannelConfig;
}
//# sourceMappingURL=dispatcher.service.d.ts.map