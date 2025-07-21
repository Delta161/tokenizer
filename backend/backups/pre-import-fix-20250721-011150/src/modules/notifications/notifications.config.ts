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
export const defaultNotificationConfig: NotificationConfig = {
  inApp: {
    enabled: true,
    options: {
      maxNotificationsPerUser: 100,
      expirationDays: 30,
    },
  },
  email: {
    enabled: false,
    options: {
      fromEmail: 'notifications@tokenizer.example.com',
      fromName: 'Tokenizer Notifications',
      subjectPrefix: '[Tokenizer] ',
    },
  },
  webhook: {
    enabled: false,
    options: {
      retryIntervals: [1000, 5000, 15000], // Retry intervals in milliseconds
      timeout: 5000, // Webhook request timeout in milliseconds
    },
  },
  socket: {
    enabled: false,
    options: {
      namespace: '/notifications',
      eventName: 'notification',
    },
  },
  deliveryTimeoutMs: 10000, // 10 seconds
  maxRetries: 3,
  logging: true,
};

/**
 * Create a notification configuration by merging with the default configuration
 * @param config Partial configuration to merge with the default configuration
 * @returns Complete notification configuration
 */
export function createNotificationConfig(
  config: Partial<NotificationConfig> = {}
): NotificationConfig {
  return {
    ...defaultNotificationConfig,
    ...config,
    inApp: {
      ...defaultNotificationConfig.inApp,
      ...config.inApp,
    },
    email: {
      ...defaultNotificationConfig.email,
      ...config.email,
    },
    webhook: {
      ...defaultNotificationConfig.webhook,
      ...config.webhook,
    },
    socket: {
      ...defaultNotificationConfig.socket,
      ...config.socket,
    },
  };
}