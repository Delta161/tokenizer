import { Notification } from '@prisma/client';
import { UserPublicDTO } from '../../accounts/types/user.types';

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
    count?: number;
  };
  error?: string;
  details?: unknown;
}

/**
 * Interface for notification channel
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
   * @returns True if channel is available
   */
  isAvailableFor(user: UserPublicDTO, notification?: NotificationDto): boolean;
}

/**
 * Result of a notification dispatch operation
 */
export interface NotificationDispatchResult {
  success: boolean;
  error?: string;
  channelResults?: {
    channelId: string;
    success: boolean;
    error?: string;
  }[];
}

/**
 * Configuration for notification channels
 */
export interface NotificationConfig {
  /**
   * Configuration for in-app notifications
   */
  inApp: {
    enabled: boolean;
    options?: Record<string, unknown>;
  };
  
  /**
   * Configuration for email notifications
   */
  email: {
    enabled: boolean;
    options?: Record<string, unknown>;
  };
  
  /**
   * Configuration for webhook notifications
   */
  webhook: {
    enabled: boolean;
    options?: Record<string, unknown>;
  };
  
  /**
   * Configuration for socket notifications
   */
  socket: {
    enabled: boolean;
    options?: Record<string, unknown>;
  };
  
  /**
   * Default timeout for notification delivery in milliseconds
   */
  deliveryTimeoutMs: number;
  
  /**
   * Maximum number of retries for failed deliveries
   */
  maxRetries: number;
  
  /**
   * Delay between retries in milliseconds
   */
  retryDelayMs: number;
}

/**
 * Options for getting user notifications
 */
export interface GetNotificationsOptions {
  /**
   * Filter by read status
   */
  read?: boolean;
  
  /**
   * Filter by notification type
   */
  type?: string;
  
  /**
   * Number of items to skip (for pagination)
   */
  skip?: number;
  
  /**
   * Number of items to take (for pagination)
   */
  take?: number;
}

/**
 * Parameters for broadcasting a notification
 */
export interface BroadcastNotificationParams {
  /**
   * IDs of users to send notification to
   */
  userIds: string[];
  
  /**
   * Notification type
   */
  type: string;
  
  /**
   * Notification title
   */
  title: string;
  
  /**
   * Notification message
   */
  message: string;
  
  /**
   * Optional additional data
   */
  metadata?: Record<string, unknown>;
}