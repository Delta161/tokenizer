/**
 * Express Application Setup
 */

import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

// Import configuration
import { env } from './config/env';
import { API_PREFIX, RATE_LIMIT } from './config/constants';

// Import middleware
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Import routes
import { authRouter } from './modules/auth/auth.routes';
import { createClientRoutes } from './modules/client';
import { createInvestorRoutes } from './modules/investor';
import { createTokenRoutes } from './modules/token';
import { createProjectsRoutes } from './modules/projects';
import { initExamplesModule } from './modules/examples';

// Initialize Prisma client
const prisma = new PrismaClient();

// Create Express application
const app: Express = express();

// Apply middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(helmet());
app.use(compression());

// Setup request logging
if (env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Apply rate limiting
app.use(
  rateLimit({
    windowMs: RATE_LIMIT.WINDOW_MS,
    max: RATE_LIMIT.MAX_REQUESTS,
    standardHeaders: true,
    legacyHeaders: false,
  })
);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Mount API routes
app.use(`${API_PREFIX}/auth`, authRouter);
// Add other module routes here as they are implemented
// app.use(`${API_PREFIX}/users`, userRouter);
app.use(`${API_PREFIX}/properties`, createPropertyRoutes());
app.use(`${API_PREFIX}/clients`, createClientRoutes());
app.use(`${API_PREFIX}/investors`, createInvestorRoutes());
app.use(`${API_PREFIX}/tokens`, createTokenRoutes());
app.use(`${API_PREFIX}/projects`, createProjectsRoutes(prisma));
app.use(`${API_PREFIX}/examples`, initExamplesModule());
// etc.

// Apply error handling middleware
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
