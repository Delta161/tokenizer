import { NotificationDispatcherService } from './dispatcher.service';
import { BaseNotificationChannel, InAppNotificationChannel, EmailNotificationChannel, WebhookNotificationChannel, SocketNotificationChannel, createNotificationChannels } from './channels';
/**
 * Export all notification delivery components
 */
export { 
// Dispatcher service
NotificationDispatcherService, BaseNotificationChannel, 
// Channel implementations
InAppNotificationChannel, EmailNotificationChannel, WebhookNotificationChannel, SocketNotificationChannel, 
// Factory function
createNotificationChannels };
// Re-export notification configuration
export { defaultNotificationConfig, createNotificationConfig } from '../config/notification.config';
/**
 * Create a notification dispatcher service
 * @param config Optional configuration for the notification system
 * @returns NotificationDispatcherService instance
 */
export function createNotificationDispatcher(config) {
    return new NotificationDispatcherService(config);
}
//# sourceMappingURL=index.js.map