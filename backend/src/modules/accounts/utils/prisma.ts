/**
 * Shared Prisma Client for Accounts Module
 * Ensures a single instance of PrismaClient is used throughout the accounts module
 */

// Import the centralized Prisma client using correct path
import { prisma } from '../../../prisma/client';

// Re-export the centralized Prisma client
export { prisma };
