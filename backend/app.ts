/**
 * Express Application Setup
 * Simplified version without path alias dependencies
 */

// Load environment variables first
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, './.env') });

// Core Express imports
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Import configuration
import { API_PREFIX, RATE_LIMIT } from './src/config/constants';

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler';

// Import ONLY the working simplified routes
import { authRouter } from './src/modules/accounts/routes/auth.routes';
import { userRouter } from './src/modules/accounts/routes/user.routes';

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

// After body parsing middleware
app.use(cookieParser());

// Rate limiting
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

// Mount the working simplified routes
console.log('Mounting auth routes at:', `${API_PREFIX}/auth`);
app.use(`${API_PREFIX}/auth`, authRouter);

console.log('Mounting user routes at:', `${API_PREFIX}/users`);
app.use(`${API_PREFIX}/users`, userRouter);

// Add a test route to verify mounting
app.get(`${API_PREFIX}/test`, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Simplified server is working!', 
    routes: ['auth', 'users'],
    timestamp: new Date().toISOString()
  });
});

// TODO: Additional module routes can be added here when path alias issues are resolved
// Examples: clients, investors, tokens, projects, examples, blockchain, investments, kyc, analytics

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;
