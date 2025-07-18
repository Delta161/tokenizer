import { Notification } from '@prisma/client';

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