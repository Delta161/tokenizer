import { InAppNotificationChannel } from './inApp.channel';
/**
 * Export all notification channel implementations
 */
export { BaseNotificationChannel } from './base.channel';
export { InAppNotificationChannel } from './inApp.channel';
export { EmailNotificationChannel } from './email.channel';
export { WebhookNotificationChannel } from './webhook.channel';
export { SocketNotificationChannel } from './socket.channel';
/**
 * Create and return all available notification channels
 * @returns Array of notification channel instances
 */
export function createNotificationChannels() {
    return [
        new InAppNotificationChannel(),
        // Future channels will be enabled here when implemented
        // new EmailNotificationChannel(),
        // new WebhookNotificationChannel(),
        // new SocketNotificationChannel(),
    ];
}
//# sourceMappingURL=index.js.map