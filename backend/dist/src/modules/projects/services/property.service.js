/**
 * Property Service
 * Handles business logic for property operations
 */
import { PropertyStatus } from '@prisma/client';
import { logger } from '../../../utils/logger';
import { mapPropertyToDTO } from '../utils/mappers';
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
            // Map to DTOs
            const propertyDTOs = properties.map(property => mapPropertyToDTO(property));
            return {
                properties: propertyDTOs,
                total
            };
        }
        catch (error) {
            logger.error('Error getting properties:', error);
            throw error;
        }
    }
    /**
     * Get property by ID
     * @param id Property ID
     * @returns Property DTO
     * @throws PropertyNotFoundError if property not found
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
                throw new PropertyNotFoundError(id);
            }
            return mapPropertyToDTO(property);
        }
        catch (error) {
            if (error instanceof PropertyNotFoundError) {
                throw error;
            }
            logger.error(`Error getting property ${id}:`, error);
            throw error;
        }
    }
    /**
     * Create a new property
     * @param clientId Client ID
     * @param data Property creation data
     * @returns Created property
     */
    async createProperty(clientId, data) {
        try {
            // Check if client exists
            const client = await this.prisma.client.findUnique({
                where: { id: clientId }
            });
            if (!client) {
                throw new PropertyValidationError('Client not found');
            }
            // Create property
            const property = await this.prisma.property.create({
                data: {
                    clientId,
                    title: data.title,
                    description: data.description,
                    country: data.country,
                    city: data.city,
                    address: data.address,
                    imageUrls: data.imageUrls,
                    totalPrice: parseFloat(data.totalPrice),
                    tokenPrice: parseFloat(data.tokenPrice),
                    irr: parseFloat(data.irr),
                    apr: parseFloat(data.apr),
                    valueGrowth: parseFloat(data.valueGrowth),
                    minInvestment: parseFloat(data.minInvestment),
                    tokensAvailablePercent: parseFloat(data.tokensAvailablePercent),
                    tokenSymbol: data.tokenSymbol,
                    status: PropertyStatus.DRAFT,
                    isFeatured: false
                },
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
            logger.info(`Property created: ${property.id} by client ${clientId}`);
            return mapPropertyToDTO(property);
        }
        catch (error) {
            logger.error('Error creating property:', error);
            throw error;
        }
    }
    /**
     * Update property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @param data Update data
     * @returns Updated property
     * @throws PropertyNotFoundError if property not found
     * @throws PropertyAccessError if client doesn't own the property
     */
    async updateProperty(id, clientId, data) {
        try {
            // Check if property exists and belongs to client
            const existingProperty = await this.prisma.property.findUnique({
                where: { id }
            });
            if (!existingProperty) {
                throw new PropertyNotFoundError(id);
            }
            if (existingProperty.clientId !== clientId) {
                throw new PropertyAccessError('You do not have permission to update this property');
            }
            // Prepare update data
            const updateData = {};
            if (data.title)
                updateData.title = data.title;
            if (data.description)
                updateData.description = data.description;
            if (data.country)
                updateData.country = data.country;
            if (data.city)
                updateData.city = data.city;
            if (data.address)
                updateData.address = data.address;
            if (data.imageUrls)
                updateData.imageUrls = data.imageUrls;
            if (data.totalPrice)
                updateData.totalPrice = parseFloat(data.totalPrice);
            if (data.tokenPrice)
                updateData.tokenPrice = parseFloat(data.tokenPrice);
            if (data.irr)
                updateData.irr = parseFloat(data.irr);
            if (data.apr)
                updateData.apr = parseFloat(data.apr);
            if (data.valueGrowth)
                updateData.valueGrowth = parseFloat(data.valueGrowth);
            if (data.minInvestment)
                updateData.minInvestment = parseFloat(data.minInvestment);
            if (data.tokensAvailablePercent)
                updateData.tokensAvailablePercent = parseFloat(data.tokensAvailablePercent);
            if (data.tokenSymbol)
                updateData.tokenSymbol = data.tokenSymbol;
            // Update property
            const updatedProperty = await this.prisma.property.update({
                where: { id },
                data: updateData,
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
            logger.info(`Property updated: ${id} by client ${clientId}`);
            return mapPropertyToDTO(updatedProperty);
        }
        catch (error) {
            if (error instanceof PropertyNotFoundError || error instanceof PropertyAccessError) {
                throw error;
            }
            logger.error(`Error updating property ${id}:`, error);
            throw error;
        }
    }
    /**
     * Update property status
     * @param id Property ID
     * @param data Status update data
     * @returns Updated property
     * @throws PropertyNotFoundError if property not found
     */
    async updatePropertyStatus(id, data) {
        try {
            // Check if property exists
            const existingProperty = await this.prisma.property.findUnique({
                where: { id }
            });
            if (!existingProperty) {
                throw new PropertyNotFoundError(id);
            }
            // Update property status
            const updatedProperty = await this.prisma.property.update({
                where: { id },
                data: { status: data.status },
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
            logger.info(`Property status updated: ${id} to ${data.status}`);
            return mapPropertyToDTO(updatedProperty);
        }
        catch (error) {
            if (error instanceof PropertyNotFoundError) {
                throw error;
            }
            logger.error(`Error updating property status ${id}:`, error);
            throw error;
        }
    }
    /**
     * Delete property
     * @param id Property ID
     * @param clientId Client ID (for authorization)
     * @returns Deleted property ID
     * @throws PropertyNotFoundError if property not found
     * @throws PropertyAccessError if client doesn't own the property
     */
    async deleteProperty(id, clientId) {
        try {
            // Check if property exists and belongs to client
            const existingProperty = await this.prisma.property.findUnique({
                where: { id }
            });
            if (!existingProperty) {
                throw new PropertyNotFoundError(id);
            }
            if (existingProperty.clientId !== clientId) {
                throw new PropertyAccessError('You do not have permission to delete this property');
            }
            // Delete property
            await this.prisma.property.delete({
                where: { id }
            });
            logger.info(`Property deleted: ${id} by client ${clientId}`);
            return id;
        }
        catch (error) {
            if (error instanceof PropertyNotFoundError || error instanceof PropertyAccessError) {
                throw error;
            }
            logger.error(`Error deleting property ${id}:`, error);
            throw error;
        }
    }
}
//# sourceMappingURL=property.service.js.map