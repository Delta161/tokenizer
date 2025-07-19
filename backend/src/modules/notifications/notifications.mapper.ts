import { Notification } from '@prisma/client';
import { NotificationDto } from './notifications.types';

/**
 * Maps a Prisma Notification model to a NotificationDto
 * @param notification - The Prisma Notification model
 * @returns NotificationDto - The mapped notification DTO
 */
export const mapNotificationToDto = (notification: Notification): NotificationDto => {
  // Parse metadata if it exists
  let metadata: Record<string, unknown> | undefined;
  if (notification.metadata) {
    try {
      metadata = JSON.parse(notification.metadata as string);
    } catch (error) {
      console.error(`Failed to parse metadata for notification ${notification.id}:`, error);
    }
  }

  return {
    id: notification.id,
    userId: notification.userId,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    isRead: notification.isRead,
    createdAt: notification.createdAt,
    readAt: notification.readAt,
    metadata,
  };
};

/**
 * Maps an array of Prisma Notification models to NotificationDto array
 * @param notifications - Array of Prisma Notification models
 * @returns NotificationDto[] - Array of mapped notification DTOs
 */
export const mapNotificationsToDto = (notifications: Notification[]): NotificationDto[] => {
  return notifications.map(mapNotificationToDto);
};