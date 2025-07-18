import { NotificationDispatcherService } from './dispatcher.service';
import {
  NotificationChannel,
  BaseNotificationChannel,
  InAppNotificationChannel,
  EmailNotificationChannel,
  WebhookNotificationChannel,
  SocketNotificationChannel,
  createNotificationChannels
} from './channels';
import { NotificationConfig } from '../config/notification.config';

/**
 * Export all notification delivery components
 */
export {
  // Dispatcher service
  NotificationDispatcherService,
  
  // Channel interfaces and base classes
  NotificationChannel,
  BaseNotificationChannel,
  
  // Channel implementations
  InAppNotificationChannel,
  EmailNotificationChannel,
  WebhookNotificationChannel,
  SocketNotificationChannel,
  
  // Factory function
  createNotificationChannels
};

// Re-export notification configuration
export { 
  NotificationConfig, 
  NotificationChannelConfig,
  defaultNotificationConfig,
  createNotificationConfig 
} from '../config/notification.config';

/**
 * Create a notification dispatcher service
 * @param config Optional configuration for the notification system
 * @returns NotificationDispatcherService instance
 */
export function createNotificationDispatcher(config?: Partial<NotificationConfig>): NotificationDispatcherService {
  return new NotificationDispatcherService(config);
}