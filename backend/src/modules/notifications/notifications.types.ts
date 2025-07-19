import { Notification } from '@prisma/client';
import { UserPublicDTO } from '../user/user.types';

/**
 * Notification types enum
 */
export enum NotificationType {
  SYSTEM = 'SYSTEM',
  KYC_APPROVED = 'KYC_APPROVED',
  KYC_REJECTED = 'KYC_REJECTED',
  INVESTMENT_CONFIRMED = 'INVESTMENT_CONFIRMED',
  TOKEN_UPDATED = 'TOKEN_UPDATED',
  PROPERTY_APPROVED = 'PROPERTY_APPROVED',
  PROPERTY_REJECTED = 'PROPERTY_REJECTED',
}

/**
 * Data transfer object for creating a new notification
 */
export interface CreateNotificationDto {
  userId: string;
  type: string;
  title: string;
  message: string;
  metadata?: Record<string, unknown>;
}

/**
 * Data transfer object for notification response
 */
export interface NotificationDto {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
  readAt: Date | null;
  metadata?: Record<string, unknown>;
}

/**
 * Response object for notification operations
 */
export interface NotificationResponse {
  success: boolean;
  message?: string;
  data?: {
    notification?: NotificationDto;
    notifications?: NotificationDto[];
  };
  error?: string;
}

/**
 * Notification count response
 */
export interface NotificationCountResponse {
  success: boolean;
  data?: {
    count: number;
  };
  error?: string;
}

/**
 * Interface for notification channel implementations
 */
export interface NotificationChannel {
  /**
   * Unique identifier for the channel
   */
  readonly channelId: string;
  
  /**
   * Send a notification through this channel
   * @param user - User to send notification to
   * @param notification - Notification to send
   */
  send(user: UserPublicDTO, notification: NotificationDto): Promise<void>;
  
  /**
   * Check if this channel is available for the given user and notification
   * @param user - User to check
   * @param notification - Notification to check
   * @returns Whether the channel is available
   */
  isAvailableFor(user: UserPublicDTO, notification?: NotificationDto): boolean;
  
  /**
   * Format notification title for this channel
   * @param notification - Notification to format
   * @returns Formatted title
   */
  formatTitle?(notification: NotificationDto): string;
  
  /**
   * Format notification message for this channel
   * @param notification - Notification to format
   * @returns Formatted message
   */
  formatMessage?(notification: NotificationDto): string;
}

/**
 * Result of a notification dispatch attempt
 */
export interface NotificationDispatchResult {
  /**
   * Whether the dispatch was successful
   */
  success: boolean;
  
  /**
   * The notification that was dispatched
   */
  notification: NotificationDto;
  
  /**
   * The channel that was used for dispatch
   */
  channelId: string;
  
  /**
   * Error message if dispatch failed
   */
  error?: string;
  
  /**
   * Timestamp of the dispatch attempt
   */
  timestamp: Date;
}

/**
 * Configuration options for notification module
 */
export interface NotificationConfig {
  /**
   * List of enabled channel IDs
   */
  enabledChannels?: string[];
  
  /**
   * Default timeout for notification dispatch in milliseconds
   */
  dispatchTimeoutMs?: number;
  
  /**
   * Whether to log dispatch attempts
   */
  logDispatchAttempts?: boolean;
  
  /**
   * Batch size for processing broadcast notifications
   */
  broadcastBatchSize?: number;
}

/**
 * Interface for notification trigger
 */
export interface NotificationTriggerInterface {
  /**
   * Trigger a notification for a single user
   * @param notificationData - Data for the notification
   * @returns The created notification or null if creation failed
   */
  triggerNotification(notificationData: CreateNotificationDto): Promise<NotificationDto | null>;
  
  /**
   * Trigger a broadcast notification for multiple users
   * @param userIds - IDs of users to send notification to
   * @param notificationData - Data for the notification (without userId)
   * @returns Array of created notifications
   */
  triggerBroadcast(
    userIds: string[],
    notificationData: Omit<CreateNotificationDto, 'userId'>
  ): Promise<NotificationDto[]>;
}