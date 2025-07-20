import { NotificationDto, NotificationChannel, NotificationConfig } from '../notifications.types';
import { UserPublicDTO } from '../../user/user.types';
/**
 * Type for channel-specific dispatch results
 */
interface ChannelDispatchResult {
    channelId: string;
    success: boolean;
    error?: string;
}
/**
 * Result of a multi-channel dispatch operation
 */
interface MultiChannelDispatchResult {
    success: boolean;
    channelResults: ChannelDispatchResult[];
}
/**
 * Service responsible for dispatching notifications to various channels
 */
export declare class NotificationDispatcherService {
    private channels;
    private config;
    private logger;
    /**
     * Create a new notification dispatcher
     * @param availableChannels - Array of notification channels to use
     * @param config - Notification configuration
     */
    constructor(availableChannels: NotificationChannel[], config: NotificationConfig);
    /**
     * Dispatch a notification to all available channels for a user
     * @param user - User to send notification to
     * @param notification - Notification to send
     * @returns Result of the dispatch operation
     */
    dispatchNotification(user: UserPublicDTO, notification: NotificationDto): Promise<MultiChannelDispatchResult>;
    /**
     * Dispatch a notification to a specific channel with timeout
     * @param channel - Channel to dispatch to
     * @param user - User to send notification to
     * @param notification - Notification to send
     * @returns Result of the channel dispatch
     */
    private dispatchToChannel;
    /**
     * Register a notification channel
     * @param channel - Channel to register
     */
    registerChannel(channel: NotificationChannel): void;
    /**
     * Get configuration for a specific channel
     * @param channelId - Channel identifier
     * @returns Channel configuration or undefined if not found
     */
    private getChannelConfig;
}
export {};
//# sourceMappingURL=dispatcher.service.d.ts.map