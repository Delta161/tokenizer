/**
 * Prisma Client Singleton
 * Ensures a single instance of PrismaClient throughout the application
 */

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';

// Declare global variable for PrismaClient instance
declare global {
  var prisma: PrismaClient | undefined;
}

// Create PrismaClient instance
export const prisma = global.prisma || new PrismaClient({
  log: [
    {
      emit: 'event',
      level: 'query',
    },
    {
      emit: 'event',
      level: 'error',
    },
    {
      emit: 'event',
      level: 'info',
    },
    {
      emit: 'event',
      level: 'warn',
    },
  ],
});

// Log queries in development mode
if (process.env.NODE_ENV === 'development') {
  prisma.$on('query', (e: any) => {
    logger.debug(`Query: ${e.query}`);
    logger.debug(`Duration: ${e.duration}ms`);
  });
}

// Log errors
prisma.$on('error', (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});

// Save PrismaClient instance to global variable in development mode
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}