import { logger } from '@utils/logger';

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
export class NotificationLogger {
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
   * Log all notifications read event
   * @param userId - User ID
   * @param count - Number of notifications marked as read
   */
  allNotificationsRead(userId: string, count: number): void {
    logger.info(`All notifications marked as read for user`, {
      userId,
      count,
      module: 'notifications',
      eventType: 'all_notifications_read'
    });
  }

  /**
   * Log notification broadcast event
   * @param userCount - Number of users notified
   * @param type - Notification type
   * @param initiatorId - ID of user who initiated the broadcast
   */
  broadcastSent(userCount: number, type: string, initiatorId?: string): void {
    logger.info('Broadcast notification sent', {
      userCount,
      type,
      initiatorId,
      module: 'notifications',
      eventType: 'notification_broadcast'
    });
  }

  /**
   * Log notification error
   * @param action - Action that failed
   * @param error - Error object or message
   * @param context - Additional context
   */
  error(action: string, error: Error | string, context?: NotificationLogContext): void {
    const errorMessage = error instanceof Error ? error.message : error;
    
    logger.error(`Notification error: ${action}`, {
      error: errorMessage,
      ...context,
      module: 'notifications',
      eventType: 'notification_error'
    });
  }
}

// Export singleton instance
export const notificationLogger = new NotificationLogger();