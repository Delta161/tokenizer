import { Request, Response } from 'express';
import { NotificationService } from '../services/notifications.service';
/**
 * Controller class for handling notification-related HTTP requests
 */
export declare class NotificationController {
    private notificationService;
    /**
     * Creates a new instance of NotificationController
     * @param notificationService - The notification service instance
     */
    constructor(notificationService: NotificationService);
    /**
     * Gets all notifications for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    getMyNotifications: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Gets the count of unread notifications for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    getUnreadCount: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Marks a notification as read
     * @param req - The Express request object
     * @param res - The Express response object
     */
    markAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Marks all notifications as read for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    markAllAsRead: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Sends a broadcast notification to multiple users (admin only)
     * @param req - The Express request object
     * @param res - The Express response object
     */
    sendBroadcast: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=notifications.controller.d.ts.map