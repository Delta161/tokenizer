import { NotificationConfig } from '../notifications.config';
import { NotificationDispatcherService } from './dispatcher.service';
export * from './channels';
export { NotificationDispatcherService, NotificationDispatchResult } from './dispatcher.service';
/**
 * Create a notification dispatcher with configured channels
 * @param config - Notification configuration
 * @returns Initialized notification dispatcher service
 */
export declare const createNotificationDispatcher: (config: NotificationConfig) => NotificationDispatcherService;
//# sourceMappingURL=index.d.ts.map