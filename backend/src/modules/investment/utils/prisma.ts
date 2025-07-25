/**
 * Shared Prisma Client for Investment Module
 * Ensures a single instance of PrismaClient is used throughout the investment module
 */

// Import the centralized Prisma client
import { prisma } from '@/prisma/client';

// Re-export the centralized Prisma client
export { prisma };