/**
 * Express Application Setup
 * Following backend coding instructions
 */

// Load environment variables at the very top before any other code executes
import dotenv from 'dotenv';
dotenv.config();

// Core Express imports
import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { rateLimit } from 'express-rate-limit';

// Session and Passport imports - MANDATORY FOR AUTHENTICATION
import session from 'express-session';
import passport from './src/config/passport'; // Import configured passport
import { createSessionConfig, sessionErrorHandler } from './src/config/session';

// Import configuration
import { API_PREFIX, RATE_LIMIT } from './src/config/constants';
import { logger } from './src/utils/logger';

// Import middleware
import { errorHandler, notFoundHandler } from './src/middleware/errorHandler';
import { performanceMonitorMiddleware } from './src/modules/accounts/middleware/performance.middleware';

// Import feature routers (using relative paths since path aliases have issues)
import { authRouter } from './src/modules/accounts/routes/auth.routes';
import { userRouter } from './src/modules/accounts/routes/user.routes';
import { performanceRouter } from './src/modules/accounts/routes';
import { projectModuleRoutes } from './src/modules/projects/routes/index';

// Create KYC router inline for now (can be moved to separate file later)
const kycRouter = express.Router();

// KYC health endpoint
kycRouter.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'KYC health endpoint working!',
    timestamp: new Date().toISOString()
  });
});

// KYC status endpoint
kycRouter.get('/me', (req, res) => {
  console.log('✅ KYC /me endpoint accessed');
  res.json({
    success: true,
    data: {
      id: 'kyc-123',
      userId: 'user-456',
      status: 'not_submitted',
      submittedAt: null,
      reviewedAt: null,
      verifiedAt: null,
      rejectionReason: null,
      documentsUploaded: false,
      personalInfoComplete: false,
      addressVerified: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    message: 'KYC status retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// KYC submit endpoint
kycRouter.post('/submit', (req, res) => {
  console.log('✅ KYC /submit endpoint accessed');
  res.json({
    success: true,
    message: 'KYC information submitted successfully',
    data: {
      id: 'kyc-123',
      status: 'pending',
      submittedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// Create Express application (instantiated exactly once)
const app: Express = express();

console.log('🚀 Initializing Express application...');

// Security middleware (helmet, CORS with frontend origin, compression)
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

app.use(compression());

// Request logging middleware (morgan configured)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Performance monitoring middleware
app.use(performanceMonitorMiddleware);

// Body parsing middleware for JSON and URL-encoded payloads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Cookie parsing middleware (required for sessions)
app.use(cookieParser());

// =============================================================================
// SESSION MANAGEMENT AND AUTHENTICATION SETUP (MANDATORY)
// =============================================================================

// Session configuration - MUST be configured before Passport
logger.info('🔧 Initializing session management...');
const sessionConfig = createSessionConfig();
app.use(session(sessionConfig));

// Session error handling
app.use(sessionErrorHandler);

// Passport initialization - MUST be after session configuration
logger.info('🔧 Initializing Passport authentication...');
app.use(passport.initialize());
app.use(passport.session()); // Enable persistent login sessions

logger.info('✅ Session management and Passport configured successfully');

// Rate limiting
const limiter = rateLimit({
  windowMs: RATE_LIMIT.WINDOW_MS,
  max: RATE_LIMIT.MAX_REQUESTS,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Too many requests',
    retryAfter: Math.ceil(RATE_LIMIT.WINDOW_MS / 1000),
  },
});
app.use(limiter);

// Health check endpoint (must be defined in app.ts per instructions)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'healthy',
    service: 'tokenizer-backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// Mount feature routers under their respective base paths
console.log(`📍 Mounting auth routes at: ${API_PREFIX}/auth`);
app.use(`${API_PREFIX}/auth`, authRouter);

console.log(`📍 Mounting user routes at: ${API_PREFIX}/users`);
app.use(`${API_PREFIX}/users`, userRouter);

console.log(`📍 Mounting KYC routes at: ${API_PREFIX}/kyc`);
app.use(`${API_PREFIX}/kyc`, kycRouter);

console.log(`📍 Mounting Performance routes at: ${API_PREFIX}/performance`);
app.use(`${API_PREFIX}/performance`, performanceRouter);

console.log(`📍 Mounting Projects routes at: ${API_PREFIX}/projects`);
app.use(`${API_PREFIX}/projects`, projectModuleRoutes);

// TODO: Mount additional feature routers when path alias issues are resolved
// app.use(`${API_PREFIX}/investments`, investmentsRouter);
// app.use(`${API_PREFIX}/blockchain`, blockchainRouter);
// app.use(`${API_PREFIX}/analytics`, analyticsRouter);

// Test endpoint for verification
app.get(`${API_PREFIX}/test`, (req, res) => {
  res.json({ 
    success: true, 
    message: 'Backend API is operational', 
    version: process.env.API_VERSION || 'v1',
    availableRoutes: {
      auth: `${API_PREFIX}/auth`,
      users: `${API_PREFIX}/users`,
      kyc: `${API_PREFIX}/kyc`,
      performance: `${API_PREFIX}/performance`,
      health: '/health',
    },
    timestamp: new Date().toISOString(),
  });
});

// Catch-all 404 handler (immediately after all routers)
app.use(notFoundHandler);

// Global error handling middleware (must be final middleware)
app.use(errorHandler);

console.log('✅ Express application configuration complete');

// Export only the configured Express app object
export default app;
