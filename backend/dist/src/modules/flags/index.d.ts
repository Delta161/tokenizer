/**
 * Feature Flags Module
 * Provides functionality for toggling features on and off without deploying new code
 */
export * from './flags.types';
export * from './flags.validators';
export { flagsService, FlagsService } from './flags.service';
export { flagsController } from './flags.controller';
export { flagsRouter, createFlagsRouter, mountFlagsRoutes } from './flags.routes';
export { validateBody, validateParams } from './flags.validation';
/**
 * Initialize the Feature Flags module
 * This function should be called during application startup
 */
export declare const initFlagsModule: () => void;
//# sourceMappingURL=index.d.ts.map