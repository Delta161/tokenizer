/**
 * Feature Flags Module
 * Provides functionality for toggling features on and off without deploying new code
 */

// Export types
export * from './flags.types';

// Export validators
export * from './flags.validators';

// Export service
export { flagsService, FlagsService } from './flags.service';

// Export controller
export { flagsController } from './flags.controller';

// Export router
export { flagsRouter, createFlagsRouter, mountFlagsRoutes } from './flags.routes';

// Export validation utilities
export { validateBody, validateParams } from './flags.validation';

/**
 * Initialize the Feature Flags module
 * This function should be called during application startup
 */
export const initFlagsModule = (): void => {
  console.log('Initializing Feature Flags module...');
  // No initialization needed for now, but this function can be extended
  // if future requirements demand it (e.g., loading flags from a file)
  console.log('Feature Flags module initialized successfully');
};