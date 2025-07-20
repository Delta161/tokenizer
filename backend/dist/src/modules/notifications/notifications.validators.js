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
 * Validate create notification request
 */
export const validateCreateNotification = (data) => {
    try {
        return { success: true, data: CreateNotificationSchema.parse(data) };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * Validate mark as read request
 */
export const validateMarkAsRead = (data) => {
    try {
        return { success: true, data: MarkAsReadSchema.parse(data) };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * Validate get notifications request
 */
export const validateGetNotifications = (data) => {
    try {
        return { success: true, data: GetNotificationsSchema.parse(data) };
    }
    catch (error) {
        return { success: false, error };
    }
};
/**
 * Validate broadcast notification request
 */
export const validateNotificationBroadcast = (data) => {
    try {
        return { success: true, data: BroadcastNotificationSchema.parse(data) };
    }
    catch (error) {
        return { success: false, error };
    }
};
//# sourceMappingURL=notifications.validators.js.map