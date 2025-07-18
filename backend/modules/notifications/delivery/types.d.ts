/**
 * Type definitions for the notification delivery system
 */

import { NotificationDto } from '../types/notifications.types';
import { UserPublicDTO } from '../../user/user.types';

/**
 * Interface for notification channel implementations
 * All notification delivery channels must implement this interface
 */
export interface NotificationChannel {
  /**
   * Unique identifier for the channel
   */
  readonly channelId: string;
  
  /**
   * Send a notification through this channel
   * @param user The user to send the notification to
   * @param notification The notification to send
   * @returns A promise that resolves when the notification has been sent
   */
  send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
  
  /**
   * Check if this channel is available for the given user and notification
   * @param user The user to check availability for
   * @param notification The notification to check availability for
   * @returns True if the channel is available, false otherwise
   */
  isAvailableFor(user: UserPublicDTO, notification: NotificationDto): boolean;
  
  /**
   * Format the notification title for this channel
   * @param title The original notification title
   * @returns The formatted title
   */
  formatTitle(title: string): string;
  
  /**
   * Format the notification message for this channel
   * @param message The original notification message
   * @returns The formatted message
   */
  formatMessage(message: string): string;
}

/**
 * Interface for the notification dispatcher service
 * Responsible for dispatching notifications to available channels
 */
export interface NotificationDispatcher {
  /**
   * Dispatch a notification to all available channels
   * @param user The user to dispatch the notification to
   * @param notification The notification to dispatch
   * @returns A promise that resolves when the notification has been dispatched to all channels
   */
  dispatchNotification(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
  
  /**
   * Register a new notification channel
   * @param channel The channel to register
   */
  registerChannel(channel: NotificationChannel): void;
}

/**
 * Interface for notification trigger
 * Provides a simple interface for triggering notifications
 */
export interface NotificationTriggerInterface {
  /**
   * Trigger a notification for a specific user
   * @param userId The ID of the user to trigger the notification for
   * @param type The type of notification
   * @param title The notification title
   * @param message The notification message
   * @param metadata Optional metadata to include with the notification
   * @returns A promise that resolves to the ID of the created notification
   */
  triggerNotification(
    userId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<string>;
  
  /**
   * Trigger a broadcast notification to all users
   * @param adminId The ID of the admin triggering the broadcast
   * @param type The type of notification
   * @param title The notification title
   * @param message The notification message
   * @param metadata Optional metadata to include with the notification
   * @returns A promise that resolves to an object containing the count of created notifications and their IDs
   */
  triggerBroadcast(
    adminId: string,
    type: string,
    title: string,
    message: string,
    metadata?: Record<string, unknown>
  ): Promise<{ count: number; notificationIds: string[] }>;
}

/**
 * Result of a notification dispatch operation
 */
export interface NotificationDispatchResult {
  /**
   * The channel ID that processed the notification
   */
  channelId: string;
  
  /**
   * Whether the dispatch was successful
   */
  success: boolean;
  
  /**
   * Error message if the dispatch failed
   */
  error?: string;
}