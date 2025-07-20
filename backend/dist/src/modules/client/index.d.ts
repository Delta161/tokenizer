/**
 * Client Module Barrel File
 *
 * This file exports all the components of the Client module
 * for clean and organized imports throughout the application.
 */
export { ClientController } from './client.controller';
export { ClientService } from './client.service';
export { createClientRoutes } from './client.routes';
export { default as clientRoutes } from './client.routes';
export { ClientApplicationDTO, ClientUpdateDTO, ClientStatusUpdateDTO, ClientPublicDTO, ClientProfileResponse, ClientListResponse, ClientApplicationResponse, ClientUpdateResponse, ClientStatusUpdateResponse, ErrorResponse, ClientIdParams, ClientListQuery } from './client.types';
export { validateClientApplication, validateClientUpdate, validateClientStatusUpdate, validateClientIdParam, validateClientListQuery, clientApplicationSchema, clientUpdateSchema, clientStatusUpdateSchema, clientIdParamSchema, clientListQuerySchema } from './client.validators';
export { mapClientToPublicDTO, mapClientsToPublicDTOs, isClientApproved, isClientPending, isClientRejected, hasRequiredApplicationFields, hasValidUpdateFields } from './client.mapper';
/**
 * Re-export ClientStatus enum from Prisma for convenience
 * This allows other modules to import the enum without directly importing from Prisma
 */
export { ClientStatus } from '@prisma/client';
//# sourceMappingURL=index.d.ts.map