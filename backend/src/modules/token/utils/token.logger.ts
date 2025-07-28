import { logger } from '../../../utils/logger';

export const tokenLogger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(`[Token] ${message}`, meta);
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    logger.error(`[Token] ${message}`, { error, ...meta });
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(`[Token] ${message}`, meta);
  },
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(`[Token] ${message}`, meta);
  }
};