import { NotificationConfig } from '../../notifications.types';
import { BaseNotificationChannel } from './base.channel';
export { BaseNotificationChannel } from './base.channel';
export { InAppNotificationChannel } from './inApp.channel';
export { EmailNotificationChannel } from './email.channel';
export { WebhookNotificationChannel } from './webhook.channel';
export { SocketNotificationChannel } from './socket.channel';
/**
 * Create notification channel instances based on configuration
 * @param config - Notification configuration
 * @returns Array of notification channel instances
 */
export declare const createNotificationChannels: (config: NotificationConfig) => BaseNotificationChannel[];
//# sourceMappingURL=index.d.ts.map