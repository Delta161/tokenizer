import { PrismaClient } from '@prisma/client';
import logger from './logger.js';

const prisma = new PrismaClient();

/**
 * Interface for token blacklist entry
 */
interface TokenBlacklistEntry {
  token: string;
  userId: string;
  expiresAt: Date;
  reason: string;
}

/**
 * In-memory token blacklist for development/testing
 * In production, this should be replaced with a Redis or database implementation
 */
const tokenBlacklist = new Map<string, TokenBlacklistEntry>();

/**
 * Add a token to the blacklist
 */
export const blacklistToken = async (token: string, userId: string, expiresAt: Date, reason: string): Promise<void> => {
  try {
    // In a production environment, you would store this in Redis or a database
    // For now, we'll use an in-memory Map
    tokenBlacklist.set(token, {
      token,
      userId,
      expiresAt,
      reason
    });
    
    logger.tokenEvent('Token blacklisted', {
      userId,
      reason,
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    logger.error('Failed to blacklist token', { userId }, error as Error);
    throw new Error('Failed to blacklist token');
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  // Check if token exists in blacklist
  if (!tokenBlacklist.has(token)) {
    return false;
  }
  
  // Check if blacklist entry has expired
  const entry = tokenBlacklist.get(token);
  if (!entry) {
    return false;
  }
  
  // If the blacklist entry has expired, remove it and return false
  if (entry.expiresAt < new Date()) {
    tokenBlacklist.delete(token);
    return false;
  }
  
  // Token is blacklisted and entry hasn't expired
  return true;
};

/**
 * Clean up expired blacklist entries
 */
export const cleanupBlacklist = (): void => {
  const now = new Date();
  let removedCount = 0;
  
  // Remove expired entries
  tokenBlacklist.forEach((entry, token) => {
    if (entry.expiresAt < now) {
      tokenBlacklist.delete(token);
      removedCount++;
    }
  });
  
  if (removedCount > 0) {
    logger.debug(`Cleaned up ${removedCount} expired blacklist entries`);
  }
};

let cleanupInterval: NodeJS.Timeout | null = null;

/**
 * Schedule periodic cleanup of the token blacklist
 * This will run every hour to remove expired tokens
 */
export const scheduleBlacklistCleanup = (): void => {
  // Run cleanup immediately on startup
  cleanupBlacklist();
  
  // Schedule cleanup to run every hour
  cleanupInterval = setInterval(cleanupBlacklist, 60 * 60 * 1000);
  
  logger.info('Token blacklist cleanup scheduler initialized');
};

/**
 * Stop the token blacklist cleanup scheduler
 * This should be called when the application is shutting down
 */
export const stopBlacklistCleanup = (): void => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    logger.info('Token blacklist cleanup scheduler stopped');
  }
};