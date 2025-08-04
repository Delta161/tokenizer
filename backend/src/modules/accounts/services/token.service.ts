/**
 * Token Service
 * Handles token blacklisting and cleanup
 */

import { logger } from '../../../utils/logger';
import { prisma } from '../utils/prisma';

// In-memory token blacklist for faster lookups
const tokenBlacklist = new Map<string, Date>();

// Cleanup interval in milliseconds (default: 1 hour)
const CLEANUP_INTERVAL = parseInt(process.env.TOKEN_BLACKLIST_CLEANUP_INTERVAL || '3600000', 10);

// Cleanup timer reference
let cleanupTimer: NodeJS.Timeout | null = null;

/**
 * Add a token to the blacklist
 */
export const blacklistToken = async (
  token: string,
  userId: string,
  expiryDate: Date,
  reason: string = 'User logout'
): Promise<void> => {
  try {
    // Add to database
    await prisma.blacklisted_token.create({
      data: {
        token,
        userId,
        expiryDate,
        reason
      }
    });

    // Add to in-memory cache
    tokenBlacklist.set(token, expiryDate);

    logger.info('Token blacklisted', { userId, reason, expiryDate });
  } catch (error) {
    logger.error('Failed to blacklist token', { userId, error });
    throw error;
  }
};

/**
 * Check if a token is blacklisted
 */
export const isTokenBlacklisted = (token: string): boolean => {
  // First check in-memory cache for performance
  if (tokenBlacklist.has(token)) {
    const expiryDate = tokenBlacklist.get(token);
    
    // If token has expired, we can remove it from the cache
    if (expiryDate && expiryDate < new Date()) {
      tokenBlacklist.delete(token);
      return false;
    }
    
    return true;
  }
  
  return false;
};

/**
 * Clean up expired tokens from the blacklist
 */
export const cleanupBlacklist = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Delete expired tokens from database
    const result = await prisma.blacklistedToken.deleteMany({
      where: {
        expiryDate: {
          lt: now
        }
      }
    });
    
    // Clean up in-memory cache
    for (const [token, expiryDate] of tokenBlacklist.entries()) {
      if (expiryDate < now) {
        tokenBlacklist.delete(token);
      }
    }
    
    logger.info(`Cleaned up ${result.count} expired tokens from blacklist`);
  } catch (error) {
    logger.error('Failed to clean up token blacklist', { error });
  }
};

/**
 * Load active blacklisted tokens from database into memory
 */
export const loadBlacklistedTokens = async (): Promise<void> => {
  try {
    const now = new Date();
    
    // Get all non-expired tokens
    const tokens = await prisma.blacklistedToken.findMany({
      where: {
        expiryDate: {
          gte: now
        }
      }
    });
    
    // Clear existing cache and reload
    tokenBlacklist.clear();
    
    tokens.forEach(token => {
      tokenBlacklist.set(token.token, token.expiryDate);
    });
    
    logger.info(`Loaded ${tokens.length} active blacklisted tokens into memory`);
  } catch (error) {
    logger.error('Failed to load blacklisted tokens', { error });
  }
};

/**
 * Schedule periodic cleanup of expired tokens
 */
export const scheduleBlacklistCleanup = (): void => {
  // First load existing blacklisted tokens
  loadBlacklistedTokens().catch(error => {
    logger.error('Failed to load initial blacklisted tokens', { error });
  });
  
  // Schedule periodic cleanup
  cleanupTimer = setInterval(cleanupBlacklist, CLEANUP_INTERVAL);
  
  logger.info(`Scheduled blacklist cleanup every ${CLEANUP_INTERVAL / 1000 / 60} minutes`);
};

/**
 * Stop the scheduled cleanup
 */
export const stopBlacklistCleanup = (): void => {
  if (cleanupTimer) {
    clearInterval(cleanupTimer);
    cleanupTimer = null;
    logger.info('Stopped blacklist cleanup scheduler');
  }
};

