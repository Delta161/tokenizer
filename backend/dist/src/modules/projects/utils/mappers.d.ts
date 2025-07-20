/**
 * Projects Module Mappers
 *
 * This file contains utility functions for mapping Prisma models to DTOs
 */
import { Client, Property, Token } from '@prisma/client';
import { ClientPublicDTO, PropertyDTO, TokenPublicDTO, ProjectDTO } from '../types';
/**
 * Map a Prisma Client model to a ClientPublicDTO
 */
export declare function mapClientToDTO(client: Client): ClientPublicDTO;
/**
 * Map a Prisma Property model to a PropertyDTO
 */
export declare function mapPropertyToDTO(property: Property): PropertyDTO;
/**
 * Map a Prisma Token model to a TokenPublicDTO
 */
export declare function mapTokenToDTO(token: Token): TokenPublicDTO;
/**
 * Map Prisma models to a ProjectDTO
 */
export declare function mapToProjectDTO(property: Property, client: Client, token?: Token): ProjectDTO;
//# sourceMappingURL=mappers.d.ts.map