/**
 * Projects Module Prisma Client
 * 
 * This file provides a shared Prisma client instance for the projects module
 */

import { PrismaClient } from '@prisma/client';

// Create a shared Prisma client instance
export const prisma = new PrismaClient();

// Export the PrismaClient type for convenience
export { PrismaClient };