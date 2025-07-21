import { NotificationConfig } from '../notifications.config';
import { NotificationDispatcherService } from './dispatcher.service';
import { createNotificationChannels } from './channels';

// Export channel types and implementations
export * from './channels';

// Export dispatcher service
export { 
  NotificationDispatcherService,
  NotificationDispatchResult 
} from './dispatcher.service';

/**
 * Create a notification dispatcher with configured channels
 * @param config - Notification configuration
 * @returns Initialized notification dispatcher service
 */
export const createNotificationDispatcher = (
  config: NotificationConfig
): NotificationDispatcherService => {
  // Create notification channels
  const channels = createNotificationChannels(config);
  
  // Create and return the dispatcher
  return new NotificationDispatcherService(channels, config);
};