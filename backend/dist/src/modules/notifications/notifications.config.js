/**
 * Configuration for the notification system
 * This file contains configuration options for the notification system
 */
/**
 * Default configuration for the notification system
 */
export const defaultNotificationConfig = {
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
export function createNotificationConfig(config = {}) {
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
//# sourceMappingURL=notifications.config.js.map