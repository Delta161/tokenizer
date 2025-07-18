import express from 'express';
import { logger } from '../../../utils/logger.js';
/**
 * Create webhook routes for KYC providers
 */
export function createWebhookRoutes(kycProviderController) {
    const router = express.Router();
    // Middleware to capture raw body for signature verification
    router.use(express.json({
        verify: (req, res, buf) => {
            // Store the raw body for signature verification
            req.rawBody = buf.toString();
        }
    }));
    // Log all webhook requests
    router.use((req, res, next) => {
        logger.info(`Webhook request received: ${req.method} ${req.originalUrl}`);
        next();
    });
    // Webhook endpoint for KYC providers
    router.post('/:provider', kycProviderController.handleWebhook);
    return router;
}
//# sourceMappingURL=webhook.routes.js.map