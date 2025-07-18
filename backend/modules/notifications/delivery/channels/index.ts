import { NotificationChannel } from './base.channel';
import { InAppNotificationChannel } from './inApp.channel';
import { EmailNotificationChannel } from './email.channel';
import { WebhookNotificationChannel } from './webhook.channel';
import { SocketNotificationChannel } from './socket.channel';

/**
 * Export all notification channel implementations
 */
export {
  NotificationChannel,
  BaseNotificationChannel
} from './base.channel';

export {
  InAppNotificationChannel
} from './inApp.channel';

export {
  EmailNotificationChannel
} from './email.channel';

export {
  WebhookNotificationChannel
} from './webhook.channel';

export {
  SocketNotificationChannel
} from './socket.channel';

/**
 * Create and return all available notification channels
 * @returns Array of notification channel instances
 */
export function createNotificationChannels(): NotificationChannel[] {
  return [
    new InAppNotificationChannel(),
    // Future channels will be enabled here when implemented
    // new EmailNotificationChannel(),
    // new WebhookNotificationChannel(),
    // new SocketNotificationChannel(),
  ];
}