import { NotificationDto } from '../../types/notifications.types';
import { UserPublicDTO } from '../../../user/user.types';
import { BaseNotificationChannel } from './base.channel';
import { notificationLogger } from '../../utils/notifications.logger';

/**
 * Socket notification channel
 * This is a stub implementation for future real-time socket delivery
 */
export class SocketNotificationChannel extends BaseNotificationChannel {
  /**
   * Channel identifier
   */
  readonly channelId: string = 'socket';
  
  /**
   * Send a notification through the socket channel
   * Currently just logs that it would send via socket (stub implementation)
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    try {
      // Log the delivery attempt
      notificationLogger.deliveryAttempt(
        notification.id,
        user.id,
        this.channelId,
        'pending'
      );
      
      // TODO: Implement actual socket sending logic
      // This would emit events to connected socket clients
      // Example implementation with Socket.IO:
      // io.to(`user:${user.id}`).emit('notification', this.formatSocketPayload(notification));
      
      // Log that this is a stub implementation
      notificationLogger.notificationEvent('Socket delivery not implemented yet', {
        notificationId: notification.id,
        userId: user.id,
        channel: this.channelId,
        status: 'skipped'
      });
      
    } catch (error) {
      // Log delivery failure
      notificationLogger.deliveryFailure(
        notification.id,
        user.id,
        this.channelId,
        error instanceof Error ? error : new Error(String(error))
      );
      
      // Re-throw the error for the dispatcher to handle
      throw error;
    }
  }
  
  /**
   * Check if this channel is available for the given user
   * Socket notifications would be available if the user has active socket connections
   * @returns Currently always false as socket delivery is not implemented
   */
  isAvailableFor(): boolean {
    // TODO: Check if user has active socket connections
    return false;
  }
  
  /**
   * Format socket payload from notification
   * @param notification - Notification to format
   * @returns Socket event payload
   */
  protected formatSocketPayload(notification: NotificationDto): Record<string, unknown> {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      read: notification.read
    };
  }
}