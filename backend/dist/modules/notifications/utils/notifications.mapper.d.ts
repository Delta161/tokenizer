import { Notification } from '@prisma/client';
import { NotificationDto } from '../types/notifications.types';
/**
 * Maps a Prisma Notification model to a NotificationDto
 * @param notification - The Prisma Notification model
 * @returns NotificationDto - The mapped notification DTO
 */
export declare const mapNotificationToDto: (notification: Notification) => NotificationDto;
/**
 * Maps an array of Prisma Notification models to NotificationDto array
 * @param notifications - Array of Prisma Notification models
 * @returns NotificationDto[] - Array of mapped notification DTOs
 */
export declare const mapNotificationsToDto: (notifications: Notification[]) => NotificationDto[];
//# sourceMappingURL=notifications.mapper.d.ts.map