import { BaseNotificationChannel } from './base.channel';
import { EmailNotificationChannel } from './email.channel';
import { InAppNotificationChannel } from './inApp.channel';
import { SocketNotificationChannel } from './socket.channel';
import { WebhookNotificationChannel } from './webhook.channel';
import { NotificationConfig } from '../../utils/notification.config';

// Export all channel classes
export {
  BaseNotificationChannel,
  EmailNotificationChannel,
  InAppNotificationChannel,
  SocketNotificationChannel,
  WebhookNotificationChannel,
};

/**
 * Create notification channels based on configuration
 * @param config - Notification configuration
 * @returns Array of notification channels
 */
export const createNotificationChannels = (
  config: NotificationConfig
): BaseNotificationChannel[] => {
  const channels: BaseNotificationChannel[] = [];

  // Add in-app channel if enabled
  if (config.inApp.enabled) {
    channels.push(new InAppNotificationChannel());
  }

  // Add email channel if enabled
  if (config.email.enabled) {
    channels.push(new EmailNotificationChannel());
  }

  // Add webhook channel if enabled
  if (config.webhook.enabled) {
    channels.push(new WebhookNotificationChannel());
  }

  // Add socket channel if enabled
  if (config.socket.enabled) {
    channels.push(new SocketNotificationChannel());
  }

  return channels;
};