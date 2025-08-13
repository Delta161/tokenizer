/**
 * Session Configuration
 * 
 * This file configures Express sessions with Prisma store for persistent session storage.
 * Following backend coding instructions for secure session management.
 * 
 * IMPORTANT: This configuration is MANDATORY for Passport session management.
 * Sessions enable the authentication state to persist across HTTP requests.
 */

// External packages
import session from 'express-session';
import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import type { Request, Response, NextFunction } from 'express';

// Internal modules - Use relative imports per backend instructions
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';

/**
 * Session configuration factory
 * Returns configured session middleware based on environment
 */
export function createSessionConfig(): session.SessionOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  
  // Validate required environment variables
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required for session management');
  }
  
  logger.info('🔧 Configuring session store', { 
    environment: process.env.NODE_ENV,
    secure: isProduction 
  });

  // Choose session store: prefer Prisma-backed store; fall back to in-memory in development
  let store: session.Store;
  const hasDatabaseUrl = Boolean(process.env.DATABASE_URL);
  const forceMemory = (process.env.SESSION_STORE ?? '').toLowerCase() === 'memory';
  try {
    if (isProduction && hasDatabaseUrl && !forceMemory) {
      store = new PrismaSessionStore(prisma, {
        checkPeriod: 2 * 60 * 1000, // Check for expired sessions every 2 minutes
        dbRecordIdIsSessionId: true,
        dbRecordIdFunction: undefined,
      });
      logger.info('🗄️ Using Prisma-backed session store');
    } else {
      store = new session.MemoryStore();
      logger.warn('⚠️ Using in-memory session store (development or no DATABASE_URL or SESSION_STORE=memory).');
    }
  } catch (err) {
    // If Prisma store fails to initialize (e.g., driver error), use memory store to avoid crash in dev
    store = new session.MemoryStore();
    logger.error('❌ Failed to initialize Prisma session store. Falling back to memory store.', {
      error: err instanceof Error ? err.message : String(err),
    });
  }
  
  return {
    // Session store configuration
    store,
    
    // Session secret (must be set in environment variables)
    secret: process.env.SESSION_SECRET,
    
    // Session behavior
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    
    // Cookie configuration
    cookie: {
      // Security settings
      secure: isProduction, // HTTPS only in production
      httpOnly: true, // Prevent XSS attacks
      sameSite: isProduction ? 'strict' : 'lax', // CSRF protection
      
      // Session duration
  maxAge: parseInt(process.env.SESSION_MAX_AGE ?? '604800000'), // 7 days default
      
      // Domain settings (only in production)
      domain: isProduction ? process.env.SESSION_DOMAIN : undefined,
    },
    
    // Session naming
  name: process.env.SESSION_NAME ?? 'tokenizer.sid',
    
    // Proxy configuration for production deployments
    proxy: isProduction,
  };
}

/**
 * Middleware to handle session errors gracefully
 */
export function sessionErrorHandler(error: Error, req: Request, res: Response, next: NextFunction): void {
  logger.error('❌ Session error occurred', { 
    error: error.message,
    url: req.url,
    method: req.method 
  });
  
  // Clear the problematic session
  if (req.session) {
    req.session.destroy((destroyError: Error) => {
      if (destroyError) {
        logger.error('❌ Failed to destroy session after error', { 
          error: destroyError.message 
        });
      }
    });
  }
  
  // Continue with error handling
  next(error);
}
