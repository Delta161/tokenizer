import { NotificationDto, NotificationChannel, NotificationDispatchResult } from '../types/notification.types';
import { notificationLogger } from '../utils/notification.logger';
import { UserService } from '../../accounts/services/user.service';

/**
 * Service for dispatching notifications to various channels
 */
export class NotificationDispatcherService {
  private channels: NotificationChannel[] = [];
  private userService: UserService;

  /**
   * Create a new notification dispatcher service
   * @param userService - User service for retrieving user information
   * @param channels - Array of notification channels
   */
  constructor(userService: UserService, channels: NotificationChannel[] = []) {
    this.userService = userService;
    this.channels = channels;
    this.logRegisteredChannels();
  }

  /**
   * Register a notification channel
   * @param channel - Channel to register
   */
  registerChannel(channel: NotificationChannel): void {
    // Check if channel with same ID already exists
    const existingChannelIndex = this.channels.findIndex(
      (c) => c.channelId === channel.channelId
    );

    if (existingChannelIndex >= 0) {
      // Replace existing channel
      this.channels[existingChannelIndex] = channel;
    } else {
      // Add new channel
      this.channels.push(channel);
    }

    this.logRegisteredChannels();
  }

  /**
   * Register multiple notification channels
   * @param channels - Channels to register
   */
  registerChannels(channels: NotificationChannel[]): void {
    channels.forEach((channel) => this.registerChannel(channel));
  }

  /**
   * Get all registered channels
   * @returns Array of registered channels
   */
  getChannels(): NotificationChannel[] {
    return [...this.channels];
  }

  /**
   * Dispatch a notification to all available channels
   * @param notification - Notification to dispatch
   * @returns Result of dispatch operation
   */
  async dispatchNotification(notification: NotificationDto): Promise<NotificationDispatchResult> {
    try {
      // Get user information
      const user = await this.userService.getUserById(notification.userId);

      if (!user) {
        notificationLogger.error(
          'dispatchNotification',
          `User not found: ${notification.userId}`,
          { notificationId: notification.id }
        );
        return {
          success: false,
          error: `User not found: ${notification.userId}`,
          channelResults: [],
        };
      }

      // Find available channels for this user and notification
      const availableChannels = this.channels.filter((channel) =>
        channel.isAvailableFor(user, notification)
      );

      if (availableChannels.length === 0) {
        notificationLogger.deliveryAttempt(
          notification.id,
          notification.userId,
          'all',
          'skipped',
          { reason: 'No available channels' }
        );
        return {
          success: true, // Still consider it a success as we tried
          channelResults: [],
        };
      }

      // Dispatch to all available channels
      const channelResults = await Promise.all(
        availableChannels.map(async (channel) => {
          try {
            await channel.send(user, notification);
            
            notificationLogger.deliveryAttempt(
              notification.id,
              notification.userId,
              channel.channelId,
              'success'
            );
            
            return {
              channelId: channel.channelId,
              success: true,
            };
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            notificationLogger.deliveryAttempt(
              notification.id,
              notification.userId,
              channel.channelId,
              'failed',
              { error: errorMessage }
            );
            
            return {
              channelId: channel.channelId,
              success: false,
              error: errorMessage,
            };
          }
        })
      );

      // Check if at least one channel succeeded
      const anySuccess = channelResults.some((result) => result.success);

      return {
        success: anySuccess,
        channelResults,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      
      notificationLogger.error(
        'dispatchNotification',
        errorMessage,
        { notificationId: notification.id, userId: notification.userId }
      );
      
      return {
        success: false,
        error: errorMessage,
        channelResults: [],
      };
    }
  }

  /**
   * Log registered channels for debugging
   */
  private logRegisteredChannels(): void {
    const channelIds = this.channels.map((channel) => channel.channelId);
    console.log(`Registered notification channels: ${channelIds.join(', ')}`);
  }
}

/**
 * Create a notification dispatcher service
 * @param userService - User service for retrieving user information
 * @param channels - Array of notification channels
 * @returns NotificationDispatcherService instance
 */
export const createNotificationDispatcher = (
  userService: UserService,
  channels: NotificationChannel[] = []
): NotificationDispatcherService => {
  return new NotificationDispatcherService(userService, channels);
};