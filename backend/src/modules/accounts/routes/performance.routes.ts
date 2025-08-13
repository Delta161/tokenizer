/**
 * Performance Routes
 * Routes for accessing performance monitoring data
 */

import express from 'express';
import { performanceController } from '../controllers/performance.controller';
import { requireAdmin } from '../middleware/user.middleware';
import { sessionGuard } from '../middleware/auth.middleware';

// Create router
const router = express.Router();

// Apply session guard and admin role requirement to all performance routes
router.use(sessionGuard, requireAdmin);

/**
 * @route GET /api/accounts/performance/metrics
 * @desc Get recent performance metrics
 * @access Admin
 */
router.get('/metrics', performanceController.getRecentMetrics);

/**
 * @route GET /api/accounts/performance/stats
 * @desc Get performance statistics
 * @access Admin
 */
router.get('/stats', performanceController.getPerformanceStats);

/**
 * @route GET /api/accounts/performance/dashboard
 * @desc Get performance dashboard data
 * @access Admin
 */
router.get('/dashboard', performanceController.getDashboardData);

// Export router
export default router;
