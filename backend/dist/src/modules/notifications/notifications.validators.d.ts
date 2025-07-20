import { z } from 'zod';
/**
 * Schema for creating a notification
 */
export declare const CreateNotificationSchema: z.ZodObject<{
    userId: z.ZodString;
    type: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
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
 * Schema for broadcasting a notification to multiple users
 */
export declare const BroadcastNotificationSchema: z.ZodObject<{
    userIds: z.ZodArray<z.ZodString>;
    type: z.ZodString;
    title: z.ZodString;
    message: z.ZodString;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodAny, z.core.SomeType>>;
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
 * Type for broadcasting a notification
 */
export type BroadcastNotificationDto = z.infer<typeof BroadcastNotificationSchema>;
/**
 * Validate create notification request
 */
export declare const validateCreateNotification: (data: unknown) => {
    success: boolean;
    data: {
        userId: string;
        type: string;
        title: string;
        message: string;
        metadata?: Record<any, unknown> | undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
};
/**
 * Validate mark as read request
 */
export declare const validateMarkAsRead: (data: unknown) => {
    success: boolean;
    data: {
        id: string;
    };
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
};
/**
 * Validate get notifications request
 */
export declare const validateGetNotifications: (data: unknown) => {
    success: boolean;
    data: {
        limit: number;
        offset: number;
        includeRead: boolean;
    };
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
};
/**
 * Validate broadcast notification request
 */
export declare const validateNotificationBroadcast: (data: unknown) => {
    success: boolean;
    data: {
        userIds: string[];
        type: string;
        title: string;
        message: string;
        metadata?: Record<any, unknown> | undefined;
    };
    error?: undefined;
} | {
    success: boolean;
    error: unknown;
    data?: undefined;
};
//# sourceMappingURL=notifications.validators.d.ts.map