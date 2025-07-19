import { logger } from '../../utils/logger.js';

/**
 * Interface for notification log context
 */
interface NotificationLogContext {
  userId?: string;
  notificationId?: string;
  type?: string;
  channel?: string;
  status?: string;
  error?: string;
  [key: string]: any;
}

/**
 * Logger class for notification events
 */
class NotificationLogger {
  /**
   * Log notification creation
   * @param userId - User ID
   * @param type - Notification type
   * @param notificationId - Notification ID
   */
  notificationCreated(userId: string, type: string, notificationId: string): void {
    logger.info('Notification created', {
      userId,
      type,
      notificationId,
      module: 'notifications',
      eventType: 'notification_created'
    });
  }

  /**
   * Log notification delivery attempt
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @param channel - Delivery channel
   * @param status - Delivery status
   * @param context - Additional context
   */
  deliveryAttempt(notificationId: string, userId: string, channel: string, status: string, context?: NotificationLogContext): void {
    logger.info(`Notification delivery ${status}`, {
      notificationId,
      userId,
      channel,
      status,
      ...context,
      module: 'notifications',
      eventType: 'notification_delivery'
    });
  }

  /**
   * Log notification delivery failure
   * @param notificationId - Notification ID
   * @param userId - User ID
   * @param channel - Delivery channel
   * @param error - Error message or object
   * @param context - Additional context
   */
  deliveryFailure(notificationId: string, userId: string, channel: string, error: Error | string, context?: NotificationLogContext): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorObj = error instanceof Error ? error : new Error(error);
    
    logger.error(`Notification delivery failed: ${errorMessage}`, {
      notificationId,
      userId,
      channel,
      status: 'failed',
      error: errorMessage,
      ...context,
      module: 'notifications',
      eventType: 'notification_delivery_failure'
    }, errorObj);
  }

  /**
   * Log notification read event
   * @param notificationId - Notification ID
   * @param userId - User ID
   */
  notificationRead(notificationId: string, userId: string): void {
    logger.info('Notification marked as read', {
      notificationId,
      userId,
      module: 'notifications',
      eventType: 'notification_read'
    });
  }

  /**
   * Log general notification event
   * @param event - Event description
   * @param context - Log context
   */
  notificationEvent(event: string, context: NotificationLogContext): void {
    logger.info(`Notification event: ${event}`, {
      ...context,
      module: 'notifications',
      eventType: 'notification_event'
    });
  }
}

// Create and export a singleton instance
const notificationLogger = new NotificationLogger();

export { notificationLogger };