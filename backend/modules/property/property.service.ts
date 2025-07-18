import { PrismaClient, PropertyStatus, Prisma } from '@prisma/client';
import {
  PropertyCreateDTO,
  PropertyUpdateDTO,
  PropertyStatusUpdateDTO,
  PropertyPublicDTO,
  PropertyListQuery,
  PropertyListResponse
} from './property.types.js';
import { mapPropertyToPublicDTO, mapPropertiesToPublicDTOs } from './property.mapper.js';
import { logger } from '../../utils/logger.js';

// Custom error classes for better error handling
export class PropertyNotFoundError extends Error {
  constructor(id: string) {
    super(`Property with ID ${id} not found`);
    this.name = 'PropertyNotFoundError';
  }
}

export class PropertyAccessError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PropertyAccessError';
  }
}

export class PropertyValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PropertyValidationError';
  }
}

export class PropertyService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Get all approved properties with pagination
   * @param query Query parameters for filtering and pagination
   * @returns Paginated list of approved properties
   */
  async getAllApproved(query: PropertyListQuery): Promise<PropertyListResponse> {
    try {
      const where = { status: PropertyStatus.APPROVED };
      const limit = query.limit ? parseInt(query.limit, 10) : 10;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;
      
      // Get total count for pagination
      const total = await this.prisma.property.count({ where });
      
      // Get paginated properties
      const properties = await this.prisma.property.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' },
        skip: offset,
        take: limit
      });
      
      const propertyDTOs = mapPropertiesToPublicDTOs(properties);
      
      logger.info('Retrieved approved properties', { 
        module: 'property',
        count: properties.length,
        total,
        limit,
        offset
      });
      
      return {
        success: true,
        data: propertyDTOs,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + properties.length < total
        }
      };
    } catch (error) {
      logger.error('Error retrieving approved properties', { 
        module: 'property',
        error
      });
      throw error;
    }
  }

  /**
   * Get a property by ID if it's approved
   * @param id Property ID
   * @returns Property details or null if not found/not approved
   */
  async getByIdIfApproved(id: string): Promise<PropertyPublicDTO | null> {
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
      
      logger.info('Retrieved property by ID', { 
        module: 'property',
        propertyId: id 
      });
      
      return mapPropertyToPublicDTO(property);
    } catch (error) {
      logger.error('Error retrieving property by ID', { 
        module: 'property',
        propertyId: id,
        error 
      });
      throw error;
    }
  }

  /**
   * Get properties belonging to a specific client
   * @param clientId Client ID
   * @returns List of properties for the client
   */
  async getMyProperties(clientId: string): Promise<PropertyListResponse> {
    try {
      if (!clientId) {
        throw new PropertyAccessError('Client ID is required');
      }
      
      const total = await this.prisma.property.count({ where: { clientId } });
      
      const properties = await this.prisma.property.findMany({ 
        where: { clientId }, 
        orderBy: { createdAt: 'desc' } 
      });
      
      const propertyDTOs = mapPropertiesToPublicDTOs(properties);
      
      logger.info('Retrieved client properties', { 
        module: 'property',
        clientId,
        count: properties.length 
      });
      
      return {
        success: true,
        data: propertyDTOs,
        pagination: {
          limit: properties.length,
          offset: 0,
          total,
          hasMore: false
        }
      };
    } catch (error) {
      logger.error('Error retrieving client properties', { 
        module: 'property',
        clientId,
        error 
      });
      throw error;
    }
  }

  /**
   * Create a new property
   * @param clientId Client ID
   * @param dto Property creation data
   * @param userId User ID for audit logging
   * @returns Created property
   */
  async create(clientId: string, dto: PropertyCreateDTO, userId?: string): Promise<PropertyPublicDTO | null> {
    try {
      if (!clientId) {
        throw new PropertyAccessError('Client ID is required');
      }
      
      // Check if token symbol already exists
      const existingProperty = await this.prisma.property.findUnique({
        where: { tokenSymbol: dto.tokenSymbol }
      });
      
      if (existingProperty) {
        throw new PropertyValidationError(`Token symbol '${dto.tokenSymbol}' is already in use`);
      }
      
      // Use a transaction to ensure data consistency
      const property = await this.prisma.$transaction(async (tx) => {
        // Create the property
        const newProperty = await tx.property.create({
          data: {
            ...dto,
            clientId,
            status: PropertyStatus.DRAFT,
            imageUrls: dto.imageUrls,
            totalPrice: dto.totalPrice,
            tokenPrice: dto.tokenPrice,
            irr: dto.irr,
            apr: dto.apr,
            valueGrowth: dto.valueGrowth,
            minInvestment: dto.minInvestment,
            tokensAvailablePercent: dto.tokensAvailablePercent,
            tokenSymbol: dto.tokenSymbol,
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
        tokenSymbol: dto.tokenSymbol
      });
      
      return mapPropertyToPublicDTO(property);
    } catch (error) {
      logger.error('Error creating property', { 
        module: 'property',
        clientId,
        tokenSymbol: dto.tokenSymbol,
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
   * @param clientId Client ID
   * @param id Property ID
   * @param dto Property update data
   * @param userId User ID for audit logging
   * @returns Updated property or null if not found/not editable
   */
  async update(clientId: string, id: string, dto: PropertyUpdateDTO, userId?: string): Promise<PropertyPublicDTO | null> {
    try {
      if (!clientId) {
        throw new PropertyAccessError('Client ID is required');
      }
      
      // Find the property first to check permissions
      const property = await this.prisma.property.findUnique({ where: { id } });
      
      // Check if property exists and belongs to the client
      if (!property) {
        logger.info('Property not found for update', { 
          module: 'property',
          propertyId: id 
        });
        return null;
      }
      
      // Check if client owns the property
      if (property.clientId !== clientId) {
        logger.warn('Unauthorized property update attempt', { 
          module: 'property',
          propertyId: id,
          requestedByClientId: clientId,
          actualClientId: property.clientId
        });
        throw new PropertyAccessError('You do not have permission to update this property');
      }
      
      // Check if property is in an editable state
      if (property.status === PropertyStatus.APPROVED) {
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
          data: dto 
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
                updatedFields: Object.keys(dto)
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
        updatedFields: Object.keys(dto)
      });
      
      return mapPropertyToPublicDTO(updated);
    } catch (error) {
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
      
      // For other errors, maintain the original contract
      return null;
    }
  }

  /**
   * Delete a property
   * @param clientId Client ID
   * @param id Property ID
   * @param userId User ID for audit logging
   * @returns True if deleted, false if not found/not deletable
   */
  async delete(clientId: string, id: string, userId?: string): Promise<boolean> {
    try {
      if (!clientId) {
        throw new PropertyAccessError('Client ID is required');
      }
      
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
      
      // Check if client owns the property
      if (property.clientId !== clientId) {
        logger.warn('Unauthorized property deletion attempt', { 
          module: 'property',
          propertyId: id,
          requestedByClientId: clientId,
          actualClientId: property.clientId
        });
        throw new PropertyAccessError('You do not have permission to delete this property');
      }
      
      // Check if property is in a deletable state
      if (property.status === PropertyStatus.APPROVED) {
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
    } catch (error) {
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
      
      // For other errors, maintain the original contract
      return false;
    }
  }

  /**
   * Get all properties for admin with filtering and pagination
   * @param query Query parameters for filtering and pagination
   * @returns Paginated list of properties
   */
  async getAllAdmin(query: PropertyListQuery): Promise<PropertyListResponse> {
    try {
      const where: any = {};
      if (query.status) where.status = query.status;
      
      const limit = query.limit ? parseInt(query.limit, 10) : 10;
      const offset = query.offset ? parseInt(query.offset, 10) : 0;
      
      // Get total count for pagination
      const total = await this.prisma.property.count({ where });
      
      // Get paginated properties
      const properties = await this.prisma.property.findMany({ 
        where, 
        orderBy: { createdAt: 'desc' },
        skip: offset,
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
      
      const propertyDTOs = mapPropertiesToPublicDTOs(properties);
      
      logger.info('Retrieved properties for admin', { 
        module: 'property',
        count: properties.length,
        total,
        limit,
        offset,
        statusFilter: query.status || 'all'
      });
      
      return {
        success: true,
        data: propertyDTOs,
        pagination: {
          limit,
          offset,
          total,
          hasMore: offset + properties.length < total
        }
      };
    } catch (error) {
      logger.error('Error retrieving properties for admin', { 
        module: 'property',
        error,
        query
      });
      throw error;
    }
  }

  /**
   * Update the status of a property
   * @param id Property ID
   * @param dto Status update data
   * @param userId User ID for audit logging
   * @returns Updated property or null if not found
   */
  async updateStatus(id: string, dto: PropertyStatusUpdateDTO, userId?: string): Promise<PropertyPublicDTO | null> {
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
          data: { status: dto.status } 
        });
        
        // Create audit log entry if userId is provided
        if (userId) {
          const actionType = dto.status === PropertyStatus.APPROVED 
            ? 'PROPERTY_APPROVED' 
            : dto.status === PropertyStatus.REJECTED 
              ? 'PROPERTY_REJECTED' 
              : 'PROPERTY_UPDATED';
              
          await tx.auditLogEntry.create({
            data: {
              userId,
              actionType,
              entityType: 'Property',
              entityId: id,
              metadata: {
                title: updatedProperty.title,
                previousStatus: property.status,
                newStatus: dto.status
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
        newStatus: dto.status
      });
      
      return mapPropertyToPublicDTO(updated);
    } catch (error) {
      logger.error('Error updating property status', { 
        module: 'property',
        propertyId: id,
        status: dto.status,
        error 
      });
      
      // For consistency with the original contract
      return null;
    }
  }
}