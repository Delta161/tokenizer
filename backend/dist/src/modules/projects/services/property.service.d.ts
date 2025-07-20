/**
 * Property Service
 * Handles business logic for property operations
 */
import { PrismaClient } from '@prisma/client';
import { PropertyDTO, CreatePropertyDTO, UpdatePropertyDTO, UpdatePropertyStatusDTO, PropertyFilterOptions, PropertySortOptions, PropertyPaginationOptions } from '../types';
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
     * Get property by ID
     * @param id Property ID
     * @returns Property DTO
     * @throws PropertyNotFoundError if property not found
     */
    getPropertyById(id: string): Promise<PropertyDTO>;
    /**
     * Create a new property
     * @param clientId Client ID
     * @param data Property creation data
     * @returns Created property
     */
    createProperty(clientId: string, data: CreatePropertyDTO): Promise<PropertyDTO>;
    /**
     * Update property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param data Update data
     * @returns Updated property
     * @throws PropertyNotFoundError if property not found
     * @throws PropertyAccessError if client doesn't own the property
     */
    updateProperty(id: string, clientId: string, data: UpdatePropertyDTO): Promise<PropertyDTO>;
    /**
     * Update property status
     * @param id Property ID
     * @param data Status update data
     * @returns Updated property
     * @throws PropertyNotFoundError if property not found
     */
    updatePropertyStatus(id: string, data: UpdatePropertyStatusDTO): Promise<PropertyDTO>;
    /**
     * Delete property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @returns Deleted property ID
     * @throws PropertyNotFoundError if property not found
     * @throws PropertyAccessError if client doesn't own the property
     */
    deleteProperty(id: string, clientId: string): Promise<string>;
}
//# sourceMappingURL=property.service.d.ts.map