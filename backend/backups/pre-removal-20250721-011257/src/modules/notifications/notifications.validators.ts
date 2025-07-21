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
 * Type for broadcasting a notification
 */
export type BroadcastNotificationDto = z.infer<typeof BroadcastNotificationSchema>;

/**
 * Validate create notification request
 */
export const validateCreateNotification = (data: unknown) => {
  try {
    return { success: true, data: CreateNotificationSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Validate mark as read request
 */
export const validateMarkAsRead = (data: unknown) => {
  try {
    return { success: true, data: MarkAsReadSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Validate get notifications request
 */
export const validateGetNotifications = (data: unknown) => {
  try {
    return { success: true, data: GetNotificationsSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};

/**
 * Validate broadcast notification request
 */
export const validateNotificationBroadcast = (data: unknown) => {
  try {
    return { success: true, data: BroadcastNotificationSchema.parse(data) };
  } catch (error) {
    return { success: false, error };
  }
};