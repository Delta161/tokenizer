import { NotificationChannel } from './base.channel';
/**
 * Export all notification channel implementations
 */
export { NotificationChannel, BaseNotificationChannel } from './base.channel';
export { InAppNotificationChannel } from './inApp.channel';
export { EmailNotificationChannel } from './email.channel';
export { WebhookNotificationChannel } from './webhook.channel';
export { SocketNotificationChannel } from './socket.channel';
/**
 * Create and return all available notification channels
 * @returns Array of notification channel instances
 */
export declare function createNotificationChannels(): NotificationChannel[];
//# sourceMappingURL=index.d.ts.map