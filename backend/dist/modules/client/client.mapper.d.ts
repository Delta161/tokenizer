import { Client } from '@prisma/client';
import { ClientPublicDTO } from './client.types.js';
/**
 * Maps a Prisma Client model to a safe public DTO
 * Excludes sensitive fields and ensures consistent output format
 */
export declare const mapClientToPublicDTO: (client: Client) => ClientPublicDTO;
/**
 * Maps an array of Prisma Client models to public DTOs
 */
export declare const mapClientsToPublicDTOs: (clients: Client[]) => ClientPublicDTO[];
/**
 * Checks if a client is in a specific status
 */
export declare const isClientApproved: (client: Client) => boolean;
export declare const isClientPending: (client: Client) => boolean;
export declare const isClientRejected: (client: Client) => boolean;
/**
 * Utility function to check if client data has required fields for application
 */
export declare const hasRequiredApplicationFields: (data: any) => boolean;
/**
 * Utility function to check if update data contains any valid fields
 */
export declare const hasValidUpdateFields: (data: any) => boolean;
//# sourceMappingURL=client.mapper.d.ts.map