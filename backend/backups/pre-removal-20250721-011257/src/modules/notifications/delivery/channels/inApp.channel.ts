import { NotificationDto } from '../../notifications.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { BaseNotificationChannel } from './base.channel';

/**
 * In-app notification channel
 * This channel is used for delivering notifications within the application
 * Currently, it only logs the notification delivery (no-op implementation)
 */
export class InAppNotificationChannel extends BaseNotificationChannel {
  /**
   * Channel identifier
   */
  readonly channelId: string = 'in-app';
  
  /**
   * Send a notification through the in-app channel
   * Currently just logs the notification (no-op implementation)
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    try {
      this.logger.info(`Attempting to deliver notification ${notification.id} to user ${user.id} via in-app channel`);
      
      // In a real implementation, this would trigger a push to the user's
      // connected clients or store the notification for retrieval
      // For now, we just log that it was "delivered"
      
      // Simulate a small delay to mimic actual delivery
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Log successful delivery
      this.logDeliveryAttempt(user, notification, true);
    } catch (error) {
      // Log delivery failure
      const errorMessage = error instanceof Error ? error.message : String(error);
      this.logDeliveryAttempt(user, notification, false, errorMessage);
      
      // Re-throw the error for the dispatcher to handle
      throw error;
    }
  }
  
  /**
   * Check if this channel is available for the given user and notification
   * In-app notifications are always available
   * @returns Always true
   */
  isAvailableFor(): boolean {
    return true;
  }
}