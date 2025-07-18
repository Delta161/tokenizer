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
 * Validate create notification request
 */
export const validateCreateNotification = (data) => {
    return CreateNotificationSchema.parse(data);
};
/**
 * Validate mark as read request
 */
export const validateMarkAsRead = (data) => {
    return MarkAsReadSchema.parse(data);
};
/**
 * Validate get notifications request
 */
export const validateGetNotifications = (data) => {
    return GetNotificationsSchema.parse(data);
};
//# sourceMappingURL=notifications.validators.js.map