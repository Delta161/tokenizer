/**
 * Server Entry Point
 */

import app from '../app';
import { logger } from './utils/logger';
import { prisma } from './prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Simple environment validation
const validateEnv = (): void => {
  const requiredEnvVars = [
    'DATABASE_URL', 
    'SESSION_SECRET' // MANDATORY for session management
  ];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: Environment variable ${envVar} is not set.`);
    }
  }
  
  // Warn about using default secrets in production
  if (process.env.NODE_ENV === 'production') {
    if (process.env.SESSION_SECRET?.includes('change-in-production')) {
      console.warn('Warning: Using default SESSION_SECRET in production environment!');
    }
  }
};

// Validate environment variables
validateEnv();

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  const details = `${error.message}${error.stack ? `\n${error.stack}` : ''}`;
  logger.error(`Uncaught Exception: ${details}`);
  if ((process.env.NODE_ENV ?? 'development') === 'production') {
    throw error; // Let process manager handle exit in production
  }
});

// Start server
const PORT = parseInt(process.env.PORT ?? '3000', 10);
const NODE_ENV = process.env.NODE_ENV ?? 'development';

const server = app.listen(PORT, () => {
  logger.info(`Server running in ${NODE_ENV} mode on port ${PORT}`);
  logger.info(`API available at http://localhost:${PORT}/api/v1`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: unknown) => {
  let details: string;
  if (reason instanceof Error) {
    details = `${reason.message}${reason.stack ? `\n${reason.stack}` : ''}`;
  } else {
    try {
      details = JSON.stringify(reason);
    } catch {
      details = String(reason);
    }
  }
  logger.error(`Unhandled Rejection: ${details}`);
  const prod = (process.env.NODE_ENV ?? 'development') === 'production';
  if (prod) {
    server.close(() => {
      // Re-throw to surface to process manager
      if (reason instanceof Error) {
        throw reason;
      }
      throw new Error('Unhandled promise rejection');
    });
  }
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully');
  server.close(() => {
    prisma.$disconnect()
      .catch((e) => logger.error(`Error during Prisma disconnect: ${e instanceof Error ? e.message : String(e)}`))
      .finally(() => logger.info('Process terminated'));
  });
});