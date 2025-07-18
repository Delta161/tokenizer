import { NotificationDispatcherService } from './dispatcher.service';
import { NotificationChannel, BaseNotificationChannel, InAppNotificationChannel, EmailNotificationChannel, WebhookNotificationChannel, SocketNotificationChannel, createNotificationChannels } from './channels';
import { NotificationConfig } from '../config/notification.config';
/**
 * Export all notification delivery components
 */
export { NotificationDispatcherService, NotificationChannel, BaseNotificationChannel, InAppNotificationChannel, EmailNotificationChannel, WebhookNotificationChannel, SocketNotificationChannel, createNotificationChannels };
export { NotificationConfig, NotificationChannelConfig, defaultNotificationConfig, createNotificationConfig } from '../config/notification.config';
/**
 * Create a notification dispatcher service
 * @param config Optional configuration for the notification system
 * @returns NotificationDispatcherService instance
 */
export declare function createNotificationDispatcher(config?: Partial<NotificationConfig>): NotificationDispatcherService;
//# sourceMappingURL=index.d.ts.map