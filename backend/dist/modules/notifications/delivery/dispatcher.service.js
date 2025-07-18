import { createNotificationChannels } from './channels';
import { notificationLogger } from '../utils/notifications.logger';
import { defaultNotificationConfig } from '../config/notification.config';
/**
 * Service responsible for dispatching notifications to various delivery channels
 */
export class NotificationDispatcherService {
    channels;
    config;
    /**
     * Create a new NotificationDispatcherService
     * Initializes with all available notification channels
     * @param config - Optional configuration for the notification system
     */
    constructor(config) {
        this.config = { ...defaultNotificationConfig, ...config };
        this.channels = createNotificationChannels();
        // Filter out disabled channels based on configuration
        this.channels = this.channels.filter(channel => {
            const channelConfig = this.getChannelConfig(channel.channelId);
            return channelConfig?.enabled ?? true;
        });
        notificationLogger.info('Notification dispatcher initialized with channels', {
            channelIds: this.channels.map(channel => channel.channelId),
            config: this.config
        });
    }
    /**
     * Dispatch a notification to all available channels for the user
     * @param user - User to dispatch notification to
     * @param notification - Notification to dispatch
     * @returns Promise resolving when all dispatches are complete
     */
    async dispatchNotification(user, notification) {
        if (!this.config.logging) {
            console.log('Dispatching notification', notification.id, 'to user', user.id);
        }
        else {
            notificationLogger.info('Dispatching notification', {
                notificationId: notification.id,
                userId: user.id,
                type: notification.type
            });
        }
        // Filter channels that are available for this user and notification
        const availableChannels = this.channels.filter(channel => {
            // Check if channel is enabled in config
            const channelConfig = this.getChannelConfig(channel.channelId);
            if (!channelConfig?.enabled) {
                return false;
            }
            // Check if channel is available for this user and notification
            return channel.isAvailableFor(user, notification);
        });
        if (availableChannels.length === 0) {
            if (this.config.logging) {
                notificationLogger.warn('No available channels for notification', {
                    notificationId: notification.id,
                    userId: user.id
                });
            }
            return;
        }
        // Dispatch to all available channels in parallel with timeout
        // We use Promise.allSettled to ensure all channels are attempted
        // even if some fail
        const results = await Promise.allSettled(availableChannels.map(channel => {
            // Create a promise that times out after the configured timeout
            const timeoutPromise = new Promise((_, reject) => {
                setTimeout(() => {
                    reject(new Error(`Dispatch to channel ${channel.channelId} timed out after ${this.config.deliveryTimeoutMs}ms`));
                }, this.config.deliveryTimeoutMs);
            });
            // Race the dispatch against the timeout
            return Promise.race([
                this.dispatchToChannel(channel, user, notification),
                timeoutPromise
            ]);
        }));
        // Log overall dispatch results
        const successCount = results.filter(r => r.status === 'fulfilled').length;
        const failureCount = results.filter(r => r.status === 'rejected').length;
        notificationLogger.info('Notification dispatch complete', {
            notificationId: notification.id,
            userId: user.id,
            successCount,
            failureCount,
            totalChannels: availableChannels.length
        });
    }
    /**
     * Dispatch a notification to a specific channel
     * @param channel - Channel to dispatch to
     * @param user - User to dispatch notification to
     * @param notification - Notification to dispatch
     * @returns Promise resolving when dispatch is complete
     */
    async dispatchToChannel(channel, user, notification) {
        try {
            notificationLogger.info('Dispatching to channel', {
                notificationId: notification.id,
                userId: user.id,
                channelId: channel.channelId
            });
            // Send the notification through the channel
            await channel.send(user, notification);
            notificationLogger.info('Dispatch successful', {
                notificationId: notification.id,
                userId: user.id,
                channelId: channel.channelId
            });
        }
        catch (error) {
            // Log the error but don't re-throw it
            // This ensures that failures in one channel don't affect others
            notificationLogger.error('Dispatch failed', {
                notificationId: notification.id,
                userId: user.id,
                channelId: channel.channelId,
                error: error instanceof Error ? error.message : String(error)
            });
        }
    }
    /**
     * Register a new notification channel
     * @param channel - Channel to register
     * @param enabled - Whether the channel should be enabled (defaults to true)
     */
    registerChannel(channel, enabled = true) {
        // Check if channel with same ID already exists
        const existingIndex = this.channels.findIndex(c => c.channelId === channel.channelId);
        // Update channel config
        const channelConfig = this.getChannelConfig(channel.channelId);
        if (channelConfig) {
            channelConfig.enabled = enabled;
        }
        // Only register if enabled
        if (!enabled) {
            if (existingIndex >= 0) {
                // Remove disabled channel
                this.channels.splice(existingIndex, 1);
                if (this.config.logging) {
                    notificationLogger.info('Removed disabled notification channel', {
                        channelId: channel.channelId
                    });
                }
            }
            return;
        }
        if (existingIndex >= 0) {
            // Replace existing channel
            this.channels[existingIndex] = channel;
            if (this.config.logging) {
                notificationLogger.info('Replaced existing notification channel', {
                    channelId: channel.channelId
                });
            }
        }
        else {
            // Add new channel
            this.channels.push(channel);
            if (this.config.logging) {
                notificationLogger.info('Registered new notification channel', {
                    channelId: channel.channelId
                });
            }
        }
    }
    /**
     * Get the configuration for a specific channel
     * @param channelId - ID of the channel to get configuration for
     * @returns Channel configuration or undefined if not found
     */
    getChannelConfig(channelId) {
        switch (channelId) {
            case 'in-app':
                return this.config.inApp;
            case 'email':
                return this.config.email;
            case 'webhook':
                return this.config.webhook;
            case 'socket':
                return this.config.socket;
            default:
                return undefined;
        }
    }
}
//# sourceMappingURL=dispatcher.service.js.map