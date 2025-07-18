/**
 * Configuration for the notification system
 * This file contains configuration options for the notification system
 */
/**
 * Configuration for notification channels
 */
export interface NotificationChannelConfig {
    /**
     * Whether the channel is enabled
     */
    enabled: boolean;
    /**
     * Channel-specific configuration options
     */
    options?: Record<string, unknown>;
}
/**
 * Configuration for the notification system
 */
export interface NotificationConfig {
    /**
     * Configuration for in-app notifications
     */
    inApp: NotificationChannelConfig;
    /**
     * Configuration for email notifications
     */
    email: NotificationChannelConfig;
    /**
     * Configuration for webhook notifications
     */
    webhook: NotificationChannelConfig;
    /**
     * Configuration for socket notifications
     */
    socket: NotificationChannelConfig;
    /**
     * Default timeout for notification delivery in milliseconds
     */
    deliveryTimeoutMs: number;
    /**
     * Maximum number of retries for failed notification delivery
     */
    maxRetries: number;
    /**
     * Whether to log notification events
     */
    logging: boolean;
}
/**
 * Default configuration for the notification system
 */
export declare const defaultNotificationConfig: NotificationConfig;
/**
 * Create a notification configuration by merging with the default configuration
 * @param config Partial configuration to merge with the default configuration
 * @returns Complete notification configuration
 */
export declare function createNotificationConfig(config?: Partial<NotificationConfig>): NotificationConfig;
//# sourceMappingURL=notification.config.d.ts.map