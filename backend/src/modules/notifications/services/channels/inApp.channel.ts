import { NotificationDto } from '../../types/notification.types';
import { UserPublicDTO } from '../../../accounts/types/user.types';
import { BaseNotificationChannel } from './base.channel';

/**
 * In-app notification channel
 * This channel doesn't actually deliver notifications as they are already stored in the database
 * It's included for consistency with other channels and to allow for future extensions
 */
export class InAppNotificationChannel extends BaseNotificationChannel {
  /**
   * Create a new in-app notification channel
   */
  constructor() {
    super('in-app');
  }

  /**
   * Send an in-app notification
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  async send(user: UserPublicDTO, notification: NotificationDto): Promise<void> {
    // In-app notifications are already stored in the database
    // This method is a no-op, but we log the delivery for consistency
    this.logDeliveryAttempt(user, notification, 'success');
  }

  /**
   * Check if in-app channel is available
   * Always returns true as in-app notifications are always available
   * @returns True
   */
  isAvailableFor(): boolean {
    return true;
  }
}