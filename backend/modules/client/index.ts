/**
 * Client Module Barrel File
 * 
 * This file exports all the components of the Client module
 * for clean and organized imports throughout the application.
 */

// Main module components
export { ClientController } from './client.controller.js';
export { ClientService } from './client.service.js';
export { createClientRoutes } from './client.routes.js';
export { default as clientRoutes } from './client.routes.js';

// Types and interfaces
export {
  ClientApplicationDTO,
  ClientUpdateDTO,
  ClientStatusUpdateDTO,
  ClientPublicDTO,
  ClientProfileResponse,
  ClientListResponse,
  ClientApplicationResponse,
  ClientUpdateResponse,
  ClientStatusUpdateResponse,
  ErrorResponse,
  ClientIdParams,
  ClientListQuery,
  PaginationInfo
} from './client.types.js';

// Validation schemas
export {
  validateClientApplication,
  validateClientUpdate,
  validateClientStatusUpdate,
  validateClientIdParam,
  validateClientListQuery,
  clientApplicationSchema,
  clientUpdateSchema,
  clientStatusUpdateSchema,
  clientIdParamSchema,
  clientListQuerySchema
} from './validators/clientSchema.js';

// Mapper utilities
export {
  mapClientToPublicDTO,
  mapClientsToPublicDTOs,
  isClientApproved,
  isClientPending,
  isClientRejected,
  hasRequiredApplicationFields,
  hasValidUpdateFields
} from './client.mapper.js';

/**
 * Re-export ClientStatus enum from Prisma for convenience
 * This allows other modules to import the enum without directly importing from Prisma
 */
export { ClientStatus } from '@prisma/client';