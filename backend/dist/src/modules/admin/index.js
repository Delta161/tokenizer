import { AdminController } from './admin.controller.js';
import { AdminService } from './admin.service.js';
import { createAdminRouter } from './admin.routes.js';
import { AdminAnalyticsService } from './admin.analytics.service.js';
import { AdminAnalyticsController } from './admin.analytics.controller.js';
import { createAdminAnalyticsRouter } from './admin.analytics.routes.js';
/**
 * Initialize the admin module
 */
export const initAdminModule = (prisma, notificationTrigger) => {
    // Create service instances
    const adminService = new AdminService(notificationTrigger);
    const adminAnalyticsService = new AdminAnalyticsService();
    // Create controller instances
    const adminController = new AdminController(adminService);
    const adminAnalyticsController = new AdminAnalyticsController(adminAnalyticsService);
    // Create the main admin router
    const adminRouter = createAdminRouter(adminController);
    // Create and mount the analytics subrouter
    const analyticsRouter = createAdminAnalyticsRouter(adminAnalyticsController);
    adminRouter.use('/analytics', analyticsRouter);
    // Return the combined router
    return adminRouter;
};
//# sourceMappingURL=index.js.map