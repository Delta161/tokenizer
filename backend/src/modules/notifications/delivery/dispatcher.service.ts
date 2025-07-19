import { NotificationDto, NotificationChannel, NotificationConfig } from '../notifications.types';
import { UserPublicDTO } from '../../user/user.types';
import { Logger } from '../../../utils/logger';

/**
 * Type for channel-specific dispatch results
 */
interface ChannelDispatchResult {
  channelId: string;
  success: boolean;
  error?: string;
}

/**
 * Result of a multi-channel dispatch operation
 */
interface MultiChannelDispatchResult {
  success: boolean;
  channelResults: ChannelDispatchResult[];
}

/**
 * Service responsible for dispatching notifications to various channels
 */
export class NotificationDispatcherService {
  private channels: Map<string, NotificationChannel> = new Map();
  private config: NotificationConfig;
  private logger: Logger;

  /**
   * Create a new notification dispatcher
   * @param availableChannels - Array of notification channels to use
   * @param config - Notification configuration
   */
  constructor(
    availableChannels: NotificationChannel[],
    config: NotificationConfig
  ) {
    this.config = config;
    this.logger = new Logger('NotificationDispatcher');

    // Register all available channels
    availableChannels.forEach(channel => {
      this.registerChannel(channel);
    });

    // Log registered channels
    const channelIds = Array.from(this.channels.keys());
    this.logger.info(`Notification channels registered: ${channelIds.join(', ')}`);
  }

  /**
   * Dispatch a notification to all available channels for a user
   * @param user - User to send notification to
   * @param notification - Notification to send
   * @returns Result of the dispatch operation
   */
  async dispatchNotification(
    user: UserPublicDTO,
    notification: NotificationDto
  ): Promise<MultiChannelDispatchResult> {
    const channelResults: ChannelDispatchResult[] = [];
    let anySuccess = false;
    const dispatchTimestamp = new Date();

    // Log dispatch attempt
    this.logger.info(
      `Dispatching notification ${notification.id} to user ${user.id} via ${this.channels.size} channels`
    );

    // Create promises for all channel dispatches
    const dispatchPromises = Array.from(this.channels.values()).map(async (channel) => {
      try {
        // Check if channel is available for this user
        if (!channel.isAvailableFor(user, notification)) {
          this.logger.info(
            `Channel ${channel.channelId} not available for user ${user.id} for notification ${notification.id}`
          );
          return;
        }

        // Dispatch to channel with timeout
        const result = await this.dispatchToChannel(channel, user, notification);
        channelResults.push(result);

        if (result.success) {
          anySuccess = true;
        }
      } catch (error) {
        // This should not happen as dispatchToChannel handles errors internally
        this.logger.error(
          `Unexpected error in channel dispatch for ${channel.channelId}: ${error instanceof Error ? error.message : String(error)}`
        );

        channelResults.push({
          channelId: channel.channelId,
          success: false,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    });

    // Wait for all dispatches to complete
    await Promise.all(dispatchPromises);

    // Log dispatch result
    this.logger.info(`Notification dispatch complete for ${notification.id}`, {
      notificationId: notification.id,
      userId: user.id,
      success: anySuccess,
      channelResults,
      module: 'notifications',
      eventType: 'notification_event'
    });

    return {
      success: anySuccess,
      channelResults,
    };
  }

  /**
   * Dispatch a notification to a specific channel with timeout
   * @param channel - Channel to dispatch to
   * @param user - User to send notification to
   * @param notification - Notification to send
   * @returns Result of the channel dispatch
   */
  private async dispatchToChannel(
    channel: NotificationChannel,
    user: UserPublicDTO,
    notification: NotificationDto
  ): Promise<{ channelId: string; success: boolean; error?: string }> {
    try {
      // Get timeout for this channel
      const timeout = this.getChannelConfig(channel.channelId)?.timeoutMs || 5000;

      // Create a promise that rejects after timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error(`Channel dispatch timed out after ${timeout}ms`));
        }, timeout);
      });

      // Race the channel send against the timeout
      await Promise.race([channel.send(user, notification), timeoutPromise]);

      return {
        channelId: channel.channelId,
        success: true,
      };
    } catch (error) {
      // Log the error
      this.logger.error(`Channel dispatch failed: ${error instanceof Error ? error.message : String(error)}`, {
        error: error instanceof Error ? error.message : String(error),
        notificationId: notification.id,
        userId: user.id,
        channel: channel.channelId,
        module: 'notifications',
        eventType: 'notification_delivery_failure'
      });

      return {
        channelId: channel.channelId,
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Register a notification channel
   * @param channel - Channel to register
   */
  registerChannel(channel: NotificationChannel): void {
    const channelId = channel.channelId;
    const channelConfig = this.getChannelConfig(channelId);

    // Check if channel is enabled in config
    if (channelConfig?.enabled === false) {
      this.logger.info(`Channel disabled by configuration: ${channelId}`, {
        channel: channelId,
        module: 'notifications',
        eventType: 'notification_event'
      });
      return;
    }

    // Register or update the channel
    this.channels.set(channelId, channel);
    this.logger.info(`Channel registered: ${channelId}`, {
      channel: channelId,
      module: 'notifications',
      eventType: 'notification_event'
    });
  }

  /**
   * Get configuration for a specific channel
   * @param channelId - Channel identifier
   * @returns Channel configuration or undefined if not found
   */
  private getChannelConfig(channelId: string) {
    return this.config.channels[channelId];
  }
}