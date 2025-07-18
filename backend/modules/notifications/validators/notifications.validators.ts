import { z } from 'zod';

/**
 * Schema for creating a notification
 */
export const CreateNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.string().min(3).max(50),
  title: z.string().min(3).max(100),
  message: z.string().min(5).max(500),
});

/**
 * Schema for marking a notification as read
 */
export const MarkAsReadSchema = z.object({
  id: z.string().cuid(),
});

/**
 * Schema for getting notifications for a user
 */
export const GetNotificationsSchema = z.object({
  limit: z.number().int().positive().optional().default(10),
  offset: z.number().int().nonnegative().optional().default(0),
  includeRead: z.boolean().optional().default(false),
});

/**
 * Type for creating a notification
 */
export type CreateNotificationDto = z.infer<typeof CreateNotificationSchema>;

/**
 * Type for marking a notification as read
 */
export type MarkAsReadDto = z.infer<typeof MarkAsReadSchema>;

/**
 * Type for getting notifications for a user
 */
export type GetNotificationsDto = z.infer<typeof GetNotificationsSchema>;

/**
 * Validate create notification request
 */
export const validateCreateNotification = (data: unknown) => {
  return CreateNotificationSchema.parse(data);
};

/**
 * Validate mark as read request
 */
export const validateMarkAsRead = (data: unknown) => {
  return MarkAsReadSchema.parse(data);
};

/**
 * Validate get notifications request
 */
export const validateGetNotifications = (data: unknown) => {
  return GetNotificationsSchema.parse(data);
};