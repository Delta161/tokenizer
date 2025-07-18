import { z } from 'zod';
/**
 * Schema for creating a notification
 */
export declare const CreateNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for marking a notification as read
 */
export declare const MarkAsReadSchema: z.ZodObject<{
    id: z.ZodString;
}, z.core.$strip>;
/**
 * Schema for getting notifications for a user
 */
export declare const GetNotificationsSchema: z.ZodObject<{
    limit: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    offset: z.ZodDefault<z.ZodOptional<z.ZodNumber>>;
    includeRead: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, z.core.$strip>;
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
export declare const validateCreateNotification: (data: unknown) => {
    userId: string;
    type: string;
    title: string;
    message: string;
};
/**
 * Validate mark as read request
 */
export declare const validateMarkAsRead: (data: unknown) => {
    id: string;
};
/**
 * Validate get notifications request
 */
export declare const validateGetNotifications: (data: unknown) => {
    limit: number;
    offset: number;
    includeRead: boolean;
};
//# sourceMappingURL=notifications.validators.d.ts.map