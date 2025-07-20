import { Request, Response } from 'express';
import { NotificationService } from './notifications.service';
/**
 * Controller for notification-related API endpoints
 */
export declare class NotificationController {
    private notificationService;
    private logger;
    /**
     * Create a new notification controller
     * @param notificationService - Service for managing notifications
     */
    constructor(notificationService: NotificationService);
    /**
     * Get all notifications for the authenticated user
     * @param req - Express request
     * @param res - Express response
     */
    getMyNotifications: (req: Request, res: Response) => Promise<void>;
    /**
     * Get count of unread notifications for the authenticated user
     * @param req - Express request
     * @param res - Express response
     */
    getUnreadCount: (req: Request, res: Response) => Promise<void>;
    /**
     * Mark a notification as read
     * @param req - Express request
     * @param res - Express response
     */
    markAsRead: (req: Request, res: Response) => Promise<void>;
    /**
     * Mark all notifications as read for the authenticated user
     * @param req - Express request
     * @param res - Express response
     */
    markAllAsRead: (req: Request, res: Response) => Promise<void>;
    /**
     * Send a broadcast notification to multiple users
     * @param req - Express request
     * @param res - Express response
     */
    sendBroadcast: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=notifications.controller.d.ts.map