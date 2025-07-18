import express, { Router } from 'express';
import { KycProviderController } from './kycProvider.controller.js';
import { logger } from '../../../utils/logger.js';

/**
 * Create webhook routes for KYC providers
 */
export function createWebhookRoutes(kycProviderController: KycProviderController): Router {
  const router = express.Router();
  
  // Middleware to capture raw body for signature verification
  router.use(express.json({
    verify: (req: express.Request, res, buf) => {
      // Store the raw body for signature verification
      // Define custom property on request object
      interface RequestWithRawBody extends express.Request {
        rawBody?: string;
      }
      (req as RequestWithRawBody).rawBody = buf.toString();
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