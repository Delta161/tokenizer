/**
 * Configuration for a notification channel
 */
export interface NotificationChannelConfig {
  /**
   * Whether the channel is enabled
   */
  enabled: boolean;
  
  /**
   * Additional options for the channel
   */
  options?: Record<string, unknown>;
}

/**
 * Configuration for notifications
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
}

/**
 * Default notification configuration
 */
export const defaultNotificationConfig: NotificationConfig = {
  inApp: {
    enabled: true,
  },
  email: {
    enabled: true,
  },
  webhook: {
    enabled: false,
  },
  socket: {
    enabled: true,
  },
  deliveryTimeoutMs: 5000, // 5 seconds
};

/**
 * Get notification configuration
 * @returns Notification configuration
 */
export const getNotificationConfig = (): NotificationConfig => {
  // In a real application, this would load from environment variables or a configuration file
  return defaultNotificationConfig;
};