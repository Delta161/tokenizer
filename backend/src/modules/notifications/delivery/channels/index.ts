import { NotificationChannel, NotificationConfig } from '../../notifications.types';
import { BaseNotificationChannel } from './base.channel';
import { InAppNotificationChannel } from './inApp.channel';
import { EmailNotificationChannel } from './email.channel';
import { WebhookNotificationChannel } from './webhook.channel';
import { SocketNotificationChannel } from './socket.channel';

// Export channel interfaces and base class
export { BaseNotificationChannel } from './base.channel';

// Export specific channel implementations
export { InAppNotificationChannel } from './inApp.channel';
export { EmailNotificationChannel } from './email.channel';
export { WebhookNotificationChannel } from './webhook.channel';
export { SocketNotificationChannel } from './socket.channel';

/**
 * Create notification channel instances based on configuration
 * @param config - Notification configuration
 * @returns Array of notification channel instances
 */
export const createNotificationChannels = (
  config: NotificationConfig
): BaseNotificationChannel[] => {
  // Create channel instances
  const channels: BaseNotificationChannel[] = [
    // In-app notifications are always enabled
    new InAppNotificationChannel(),
    
    // Other channels are commented out as they're not fully implemented yet
    // Uncomment and configure as needed
    // new EmailNotificationChannel(),
    // new WebhookNotificationChannel(),
    // new SocketNotificationChannel(),
  ];
  
  return channels;
};