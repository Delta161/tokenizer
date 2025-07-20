/**
 * Property Service
 * Handles business logic for property operations
 */
import { PropertyStatus, Prisma } from '@prisma/client';
import { logger } from '../../utils/logger';
import { mapPropertyToDTO, mapPropertiesToDTOs } from './property.mapper';
// Custom error classes for better error handling
export class PropertyNotFoundError extends Error {
    constructor(id) {
        super(`Property with ID ${id} not found`);
        this.name = 'PropertyNotFoundError';
    }
}
export class PropertyAccessError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PropertyAccessError';
    }
}
export class PropertyValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'PropertyValidationError';
    }
}
export class PropertyService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    /**
     * Get properties with filtering, sorting, and pagination
     * @param filter Filter options
     * @param sort Sort options
     * @param pagination Pagination options
     * @returns Properties and count
     */
    async getProperties(filter = {}, sort = { field: 'createdAt', direction: 'desc' }, pagination = { page: 1, limit: 10 }) {
        try {
            // Build where clause based on filters
            const where = {};
            if (filter.status) {
                where.status = filter.status;
            }
            if (filter.clientId) {
                where.clientId = filter.clientId;
            }
            // Calculate pagination values
            const page = pagination.page || 1;
            const limit = pagination.limit || 10;
            const skip = (page - 1) * limit;
            // Build orderBy based on sort options
            const orderBy = {
                [sort.field]: sort.direction
            };
            // Get total count for pagination
            const total = await this.prisma.property.count({ where });
            // Get paginated properties
            const properties = await this.prisma.property.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    client: {
                        select: {
                            companyName: true,
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            const propertyDTOs = mapPropertiesToDTOs(properties);
            logger.info('Retrieved properties', {
                module: 'property',
                count: properties.length,
                total,
                page,
                limit,
                filters: filter
            });
            return {
                properties: propertyDTOs,
                total
            };
        }
        catch (error) {
            logger.error('Error retrieving properties', {
                module: 'property',
                error,
                filter,
                sort,
                pagination
            });
            throw error;
        }
    }
    /**
     * Get approved properties with pagination
     * @param pagination Pagination options
     * @returns Approved properties and count
     */
    async getApprovedProperties(pagination = { page: 1, limit: 10 }) {
        return this.getProperties({ status: PropertyStatus.APPROVED }, { field: 'createdAt', direction: 'desc' }, pagination);
    }
    /**
     * Get properties for a specific client with pagination
     * @param clientId Client ID
     * @param pagination Pagination options
     * @returns Client properties and count
     */
    async getClientProperties(clientId, pagination = { page: 1, limit: 10 }) {
        if (!clientId) {
            throw new PropertyAccessError('Client ID is required');
        }
        return this.getProperties({ clientId }, { field: 'createdAt', direction: 'desc' }, pagination);
    }
    /**
     * Get a property by ID
     * @param id Property ID
     * @returns Property or null if not found
     */
    async getPropertyById(id) {
        try {
            const property = await this.prisma.property.findUnique({
                where: { id },
                include: {
                    client: {
                        select: {
                            companyName: true,
                            user: {
                                select: {
                                    email: true
                                }
                            }
                        }
                    }
                }
            });
            if (!property) {
                logger.info('Property not found', {
                    module: 'property',
                    propertyId: id
                });
                return null;
            }
            logger.info('Retrieved property by ID', {
                module: 'property',
                propertyId: id
            });
            return mapPropertyToDTO(property);
        }
        catch (error) {
            logger.error('Error retrieving property by ID', {
                module: 'property',
                propertyId: id,
                error
            });
            throw error;
        }
    }
    /**
     * Get a property by ID if it's approved
     * @param id Property ID
     * @returns Property or null if not found/not approved
     */
    async getApprovedPropertyById(id) {
        try {
            const property = await this.prisma.property.findFirst({
                where: { id, status: PropertyStatus.APPROVED }
            });
            if (!property) {
                logger.info('Property not found or not approved', {
                    module: 'property',
                    propertyId: id
                });
                return null;
            }
            logger.info('Retrieved approved property by ID', {
                module: 'property',
                propertyId: id
            });
            return mapPropertyToDTO(property);
        }
        catch (error) {
            logger.error('Error retrieving approved property by ID', {
                module: 'property',
                propertyId: id,
                error
            });
            throw error;
        }
    }
    /**
     * Create a new property
     * @param clientId Client ID
     * @param data Property creation data
     * @param userId User ID for audit logging
     * @returns Created property
     */
    async createProperty(clientId, data, userId) {
        try {
            if (!clientId) {
                throw new PropertyAccessError('Client ID is required');
            }
            // Check if token symbol already exists
            const existingProperty = await this.prisma.property.findUnique({
                where: { tokenSymbol: data.tokenSymbol }
            });
            if (existingProperty) {
                throw new PropertyValidationError(`Token symbol '${data.tokenSymbol}' is already in use`);
            }
            // Use a transaction to ensure data consistency
            const property = await this.prisma.$transaction(async (tx) => {
                // Create the property
                const newProperty = await tx.property.create({
                    data: {
                        ...data,
                        clientId,
                        status: PropertyStatus.DRAFT,
                    },
                });
                // Create audit log entry if userId is provided
                if (userId) {
                    await tx.auditLogEntry.create({
                        data: {
                            userId,
                            actionType: 'PROPERTY_CREATED',
                            entityType: 'Property',
                            entityId: newProperty.id,
                            metadata: {
                                title: newProperty.title,
                                tokenSymbol: newProperty.tokenSymbol,
                                status: newProperty.status
                            }
                        }
                    });
                }
                return newProperty;
            });
            logger.info('Property created successfully', {
                module: 'property',
                propertyId: property.id,
                clientId,
                tokenSymbol: data.tokenSymbol
            });
            return mapPropertyToDTO(property);
        }
        catch (error) {
            logger.error('Error creating property', {
                module: 'property',
                clientId,
                tokenSymbol: data.tokenSymbol,
                error
            });
            // Rethrow specific errors
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                // Handle unique constraint violations
                if (error.code === 'P2002') {
                    throw new PropertyValidationError(`A property with this token symbol already exists`);
                }
            }
            throw error;
        }
    }
    /**
     * Update an existing property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param data Property update data
     * @param userId User ID for audit logging
     * @returns Updated property or null if not found/not editable
     */
    async updateProperty(id, clientId, data, userId) {
        try {
            // Find the property first to check permissions
            const property = await this.prisma.property.findUnique({ where: { id } });
            // Check if property exists
            if (!property) {
                logger.info('Property not found for update', {
                    module: 'property',
                    propertyId: id
                });
                return null;
            }
            // Check if client owns the property (skip if clientId is null, which means admin)
            if (clientId && property.clientId !== clientId) {
                logger.warn('Unauthorized property update attempt', {
                    module: 'property',
                    propertyId: id,
                    requestedByClientId: clientId,
                    actualClientId: property.clientId
                });
                throw new PropertyAccessError('You do not have permission to update this property');
            }
            // Check if property is in an editable state (skip for admin)
            if (clientId && property.status === PropertyStatus.APPROVED) {
                logger.warn('Attempt to update approved property', {
                    module: 'property',
                    propertyId: id,
                    clientId
                });
                throw new PropertyAccessError('Approved properties cannot be modified');
            }
            // Use a transaction to ensure data consistency
            const updated = await this.prisma.$transaction(async (tx) => {
                // Update the property
                const updatedProperty = await tx.property.update({
                    where: { id },
                    data
                });
                // Create audit log entry if userId is provided
                if (userId) {
                    await tx.auditLogEntry.create({
                        data: {
                            userId,
                            actionType: 'PROPERTY_UPDATED',
                            entityType: 'Property',
                            entityId: id,
                            metadata: {
                                title: updatedProperty.title,
                                status: updatedProperty.status,
                                updatedFields: Object.keys(data)
                            }
                        }
                    });
                }
                return updatedProperty;
            });
            logger.info('Property updated successfully', {
                module: 'property',
                propertyId: id,
                clientId,
                updatedFields: Object.keys(data)
            });
            return mapPropertyToDTO(updated);
        }
        catch (error) {
            logger.error('Error updating property', {
                module: 'property',
                propertyId: id,
                clientId,
                error
            });
            // Don't swallow specific errors we've created
            if (error instanceof PropertyAccessError ||
                error instanceof PropertyValidationError) {
                throw error;
            }
            throw error;
        }
    }
    /**
     * Update a property's status
     * @param id Property ID
     * @param data Status update data
     * @param userId User ID for audit logging
     * @returns Updated property or null if not found
     */
    async updatePropertyStatus(id, data, userId) {
        try {
            // Find the property first
            const property = await this.prisma.property.findUnique({ where: { id } });
            if (!property) {
                logger.info('Property not found for status update', {
                    module: 'property',
                    propertyId: id
                });
                return null;
            }
            // Use a transaction to ensure data consistency
            const updated = await this.prisma.$transaction(async (tx) => {
                // Update the property status
                const updatedProperty = await tx.property.update({
                    where: { id },
                    data: { status: data.status }
                });
                // Create audit log entry if userId is provided
                if (userId) {
                    const actionType = data.status === PropertyStatus.APPROVED
                        ? 'PROPERTY_APPROVED'
                        : data.status === PropertyStatus.REJECTED
                            ? 'PROPERTY_REJECTED'
                            : 'PROPERTY_STATUS_UPDATED';
                    await tx.auditLogEntry.create({
                        data: {
                            userId,
                            actionType,
                            entityType: 'Property',
                            entityId: id,
                            metadata: {
                                title: updatedProperty.title,
                                previousStatus: property.status,
                                newStatus: data.status
                            }
                        }
                    });
                }
                return updatedProperty;
            });
            logger.info('Property status updated successfully', {
                module: 'property',
                propertyId: id,
                previousStatus: property.status,
                newStatus: data.status
            });
            return mapPropertyToDTO(updated);
        }
        catch (error) {
            logger.error('Error updating property status', {
                module: 'property',
                propertyId: id,
                status: data.status,
                error
            });
            throw error;
        }
    }
    /**
     * Delete a property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param userId User ID for audit logging
     * @returns True if deleted, false if not found/not deletable
     */
    async deleteProperty(id, clientId, userId) {
        try {
            // Find the property first to check permissions
            const property = await this.prisma.property.findUnique({ where: { id } });
            // Check if property exists
            if (!property) {
                logger.info('Property not found for deletion', {
                    module: 'property',
                    propertyId: id
                });
                return false;
            }
            // Check if client owns the property (skip if clientId is null, which means admin)
            if (clientId && property.clientId !== clientId) {
                logger.warn('Unauthorized property deletion attempt', {
                    module: 'property',
                    propertyId: id,
                    requestedByClientId: clientId,
                    actualClientId: property.clientId
                });
                throw new PropertyAccessError('You do not have permission to delete this property');
            }
            // Check if property is in a deletable state (skip for admin)
            if (clientId && property.status === PropertyStatus.APPROVED) {
                logger.warn('Attempt to delete approved property', {
                    module: 'property',
                    propertyId: id,
                    clientId
                });
                throw new PropertyAccessError('Approved properties cannot be deleted');
            }
            // Use a transaction to ensure data consistency
            await this.prisma.$transaction(async (tx) => {
                // Delete the property
                await tx.property.delete({ where: { id } });
                // Create audit log entry if userId is provided
                if (userId) {
                    await tx.auditLogEntry.create({
                        data: {
                            userId,
                            actionType: 'PROPERTY_DELETED',
                            entityType: 'Property',
                            entityId: id,
                            metadata: {
                                title: property.title,
                                tokenSymbol: property.tokenSymbol,
                                status: property.status
                            }
                        }
                    });
                }
            });
            logger.info('Property deleted successfully', {
                module: 'property',
                propertyId: id,
                clientId,
                title: property.title
            });
            return true;
        }
        catch (error) {
            logger.error('Error deleting property', {
                module: 'property',
                propertyId: id,
                clientId,
                error
            });
            // Don't swallow specific errors we've created
            if (error instanceof PropertyAccessError ||
                error instanceof PropertyValidationError) {
                throw error;
            }
            return false;
        }
    }
}
//# sourceMappingURL=property.service.js.map