import { z } from 'zod';

/**
 * Schema for creating a notification
 */
export const CreateNotificationSchema = z.object({
  userId: z.string().cuid(),
  type: z.string().min(3).max(50),
  title: z.string().min(3).max(100),
  message: z.string().min(5).max(500),
  metadata: z.record(z.any()).optional(),
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
 * Schema for broadcasting a notification to multiple users
 */
export const BroadcastNotificationSchema = z.object({
  userIds: z.array(z.string().cuid()).min(1),
  type: z.string().min(3).max(50),
  title: z.string().min(3).max(100),
  message: z.string().min(5).max(500),
  metadata: z.record(z.any()).optional(),
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
 * Type for broadcasting a notification to multiple users
 */
export type BroadcastNotificationDto = z.infer<typeof BroadcastNotificationSchema>;

/**
 * Validate notification creation data
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateNotificationCreation = (data: unknown) => {
  return CreateNotificationSchema.safeParse(data);
};

/**
 * Validate notification broadcast data
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateNotificationBroadcast = (data: unknown) => {
  return BroadcastNotificationSchema.safeParse(data);
};

/**
 * Validate notification mark as read data
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateMarkAsRead = (data: unknown) => {
  return MarkAsReadSchema.safeParse(data);
};

/**
 * Validate get notifications data
 * @param data - Data to validate
 * @returns Validation result
 */
export const validateGetNotifications = (data: unknown) => {
  return GetNotificationsSchema.safeParse(data);
};