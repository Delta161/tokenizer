/**
 * Investor Logger
 * Provides logging functionality for the investor module
 */

import { logger } from '@utils/logger';

/**
 * Logger for the investor module
 */
export const investorLogger = {
  /**
   * Log info level message
   * @param message Message to log
   * @param meta Additional metadata
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(`[Investor] ${message}`, meta);
  },

  /**
   * Log error level message
   * @param message Message to log
   * @param error Error object
   * @param meta Additional metadata
   */
  error: (message: string, error?: Error, meta?: Record<string, unknown>) => {
    logger.error(`[Investor] ${message}`, {
      ...meta,
      error: error?.message,
      stack: error?.stack,
    });
  },

  /**
   * Log warning level message
   * @param message Message to log
   * @param meta Additional metadata
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(`[Investor] ${message}`, meta);
  },

  /**
   * Log debug level message
   * @param message Message to log
   * @param meta Additional metadata
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(`[Investor] ${message}`, meta);
  },
};