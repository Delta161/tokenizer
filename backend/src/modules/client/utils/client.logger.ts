import { logger } from '../../../utils/logger';

/**
 * Client module logger
 * Provides consistent logging for the client module
 */
export const clientLogger = logger.child({ module: 'client' });