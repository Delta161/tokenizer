/**
 * Property Service
 * Handles business logic for property operations
 */
import { PrismaClient } from '@prisma/client';
import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO, UpdatePropertyStatusDTO, PropertyFilterOptions, PropertySortOptions, PropertyPaginationOptions } from './property.types';
export declare class PropertyNotFoundError extends Error {
    constructor(id: string);
}
export declare class PropertyAccessError extends Error {
    constructor(message: string);
}
export declare class PropertyValidationError extends Error {
    constructor(message: string);
}
export declare class PropertyService {
    private prisma;
    constructor(prisma: PrismaClient);
    /**
     * Get properties with filtering, sorting, and pagination
     * @param filter Filter options
     * @param sort Sort options
     * @param pagination Pagination options
     * @returns Properties and count
     */
    getProperties(filter?: PropertyFilterOptions, sort?: PropertySortOptions, pagination?: PropertyPaginationOptions): Promise<{
        properties: PropertyDTO[];
        total: number;
    }>;
    /**
     * Get approved properties with pagination
     * @param pagination Pagination options
     * @returns Approved properties and count
     */
    getApprovedProperties(pagination?: PropertyPaginationOptions): Promise<{
        properties: PropertyDTO[];
        total: number;
    }>;
    /**
     * Get properties for a specific client with pagination
     * @param clientId Client ID
     * @param pagination Pagination options
     * @returns Client properties and count
     */
    getClientProperties(clientId: string, pagination?: PropertyPaginationOptions): Promise<{
        properties: PropertyDTO[];
        total: number;
    }>;
    /**
     * Get a property by ID
     * @param id Property ID
     * @returns Property or null if not found
     */
    getPropertyById(id: string): Promise<PropertyDTO | null>;
    /**
     * Get a property by ID if it's approved
     * @param id Property ID
     * @returns Property or null if not found/not approved
     */
    getApprovedPropertyById(id: string): Promise<PropertyDTO | null>;
    /**
     * Create a new property
     * @param clientId Client ID
     * @param data Property creation data
     * @param userId User ID for audit logging
     * @returns Created property
     */
    createProperty(clientId: string, data: CreatePropertyDTO, userId?: string): Promise<PropertyDTO>;
    /**
     * Update an existing property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param data Property update data
     * @param userId User ID for audit logging
     * @returns Updated property or null if not found/not editable
     */
    updateProperty(id: string, clientId: string | null, data: UpdatePropertyDTO, userId?: string): Promise<PropertyDTO | null>;
    /**
     * Update a property's status
     * @param id Property ID
     * @param data Status update data
     * @param userId User ID for audit logging
     * @returns Updated property or null if not found
     */
    updatePropertyStatus(id: string, data: UpdatePropertyStatusDTO, userId?: string): Promise<PropertyDTO | null>;
    /**
     * Delete a property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param userId User ID for audit logging
     * @returns True if deleted, false if not found/not deletable
     */
    deleteProperty(id: string, clientId: string | null, userId?: string): Promise<boolean>;
}
//# sourceMappingURL=property.service.d.ts.map