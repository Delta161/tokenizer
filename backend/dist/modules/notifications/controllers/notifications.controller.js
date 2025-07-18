import { validateGetNotifications, validateMarkAsRead } from '../validators/notifications.validators';
import { mapNotificationToDto, mapNotificationsToDto } from '../utils/notifications.mapper';
import { UserRole } from '@prisma/client';
/**
 * Controller class for handling notification-related HTTP requests
 */
export class NotificationController {
    notificationService;
    /**
     * Creates a new instance of NotificationController
     * @param notificationService - The notification service instance
     */
    constructor(notificationService) {
        this.notificationService = notificationService;
    }
    /**
     * Gets all notifications for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    async getMyNotifications = async (req, res) => {
        try {
            // Get user ID from session (set by requireAuth middleware)
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            // Validate query parameters
            const queryParams = validateGetNotifications({
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                offset: req.query.offset ? parseInt(req.query.offset) : undefined,
                includeRead: req.query.includeRead === 'true',
            });
            // Get notifications
            const notifications = await this.notificationService.getAllForUser(userId, queryParams);
            // Map to DTOs
            const notificationDtos = mapNotificationsToDto(notifications);
            return res.status(200).json({
                success: true,
                data: {
                    notifications: notificationDtos,
                },
            });
        }
        catch (error) {
            console.error('Error getting notifications:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get notifications',
            });
        }
    };
    /**
     * Gets the count of unread notifications for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    async getUnreadCount = async (req, res) => {
        try {
            // Get user ID from session (set by requireAuth middleware)
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            // Get unread count
            const count = await this.notificationService.getUnreadCount(userId);
            return res.status(200).json({
                success: true,
                data: {
                    count,
                },
            });
        }
        catch (error) {
            console.error('Error getting unread count:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get unread count',
            });
        }
    };
    /**
     * Marks a notification as read
     * @param req - The Express request object
     * @param res - The Express response object
     */
    async markAsRead = async (req, res) => {
        try {
            // Get user ID from session (set by requireAuth middleware)
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            // Validate request body
            const { id } = validateMarkAsRead(req.params);
            // Mark as read
            const notification = await this.notificationService.markAsRead(id, userId);
            // Map to DTO
            const notificationDto = mapNotificationToDto(notification);
            return res.status(200).json({
                success: true,
                data: {
                    notification: notificationDto,
                },
            });
        }
        catch (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to mark notification as read',
            });
        }
    };
    /**
     * Marks all notifications as read for the authenticated user
     * @param req - The Express request object
     * @param res - The Express response object
     */
    async markAllAsRead = async (req, res) => {
        try {
            // Get user ID from session (set by requireAuth middleware)
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            // Mark all as read
            const count = await this.notificationService.markAllAsRead(userId);
            return res.status(200).json({
                success: true,
                message: `Marked ${count} notifications as read`,
            });
        }
        catch (error) {
            console.error('Error marking all notifications as read:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to mark all notifications as read',
            });
        }
    };
    /**
     * Sends a broadcast notification to multiple users (admin only)
     * @param req - The Express request object
     * @param res - The Express response object
     */
    async sendBroadcast = async (req, res) => {
        try {
            // Check if user is admin
            if (req.user?.role !== UserRole.ADMIN) {
                return res.status(403).json({
                    success: false,
                    error: 'Forbidden: Only admins can send broadcast notifications',
                });
            }
            const { userIds, type, title, message } = req.body;
            // Validate input
            if (!Array.isArray(userIds) || userIds.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'userIds must be a non-empty array',
                });
            }
            if (!type || !title || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'type, title, and message are required',
                });
            }
            // Send broadcast
            const count = await this.notificationService.sendBroadcast(userIds, type, title, message);
            return res.status(200).json({
                success: true,
                message: `Sent ${count} notifications`,
            });
        }
        catch (error) {
            console.error('Error sending broadcast notification:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to send broadcast notification',
            });
        }
    };
}
//# sourceMappingURL=notifications.controller.js.map