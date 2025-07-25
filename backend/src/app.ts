/**
 * Express Application Setup
 */

// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Note: express-async-errors is not compatible with Express 5.x
// Async errors will be handled by the global error handler

// Core Express imports
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Import configuration
import { API_PREFIX, RATE_LIMIT } from './config/constants';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import prisma client
import { prisma } from './prisma/client';

// Import routes
import { authRouter } from './modules/accounts/routes/auth.routes';
import { createClientRoutes } from './modules/client';
import { createInvestorRoutes } from './modules/investor';
import { createTokenRoutes } from './modules/token';
import { createProjectsRoutes } from './modules/projects';
import { initExamplesModule } from './modules/examples';
import { initBlockchainModule } from './modules/blockchain';
import { registerAnalyticsModule } from './modules/analytics/analytics.module.js';
import { initInvestmentModule } from './modules/investment';
import { initKycModule } from './modules/accounts';

// Create Express application
const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true 
}));
app.use(compression());

// Request logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting
app.use(
  rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Global authentication/session middleware would go here
// TODO: Add session middleware when implemented

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount feature routers
app.use(`${API_PREFIX}/auth`, authRouter);
app.use(`${API_PREFIX}/clients`, createClientRoutes());
app.use(`${API_PREFIX}/investors`, createInvestorRoutes());
app.use(`${API_PREFIX}/tokens`, createTokenRoutes());
app.use(`${API_PREFIX}/projects`, createProjectsRoutes());
app.use(`${API_PREFIX}/examples`, initExamplesModule());
app.use(`${API_PREFIX}/blockchain`, initBlockchainModule());
app.use(`${API_PREFIX}/investments`, initInvestmentModule(prisma).routes);

// Initialize KYC module and mount routes
const kycModule = initKycModule();
app.use(`${API_PREFIX}/kyc`, kycModule.routes);

// Also mount KYC routes directly at /api/kyc for backward compatibility
app.use('/api/kyc', kycModule.routes);

// Mount analytics module
registerAnalyticsModule(app);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
