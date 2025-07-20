/**
 * Property Controller
 * Handles HTTP requests for property operations
 */
import { PrismaClient } from '@prisma/client';
import { PropertyService, PropertyAccessError, PropertyValidationError } from './property.service';
import { createPropertySchema, updatePropertySchema, updatePropertyStatusSchema, propertyIdParamSchema, propertyFilterSchema } from './property.validators';
export class PropertyController {
    propertyService;
    constructor(prisma) {
        this.propertyService = new PropertyService(prisma);
    }
    /**
     * Get all properties with filtering and pagination
     * Admin only
     */
    getProperties = async (req, res) => {
        try {
            // Validate query parameters
            const queryValidation = propertyFilterSchema.safeParse(req.query);
            if (!queryValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid query parameters',
                    details: queryValidation.error.format()
                });
                return;
            }
            const { status, page, limit, sortBy, sortDirection } = queryValidation.data;
            // Get properties with filtering and pagination
            const { properties, total } = await this.propertyService.getProperties({ status }, { field: sortBy, direction: sortDirection }, { page, limit });
            // Calculate pagination metadata
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;
            res.json({
                data: properties,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });
        }
        catch (error) {
            console.error('Error getting properties:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to retrieve properties'
            });
        }
    };
    /**
     * Get all approved properties with pagination
     * Public endpoint
     */
    getApprovedProperties = async (req, res) => {
        try {
            // Validate query parameters
            const queryValidation = propertyFilterSchema.omit({ status: true }).safeParse(req.query);
            if (!queryValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid query parameters',
                    details: queryValidation.error.format()
                });
                return;
            }
            const { page, limit } = queryValidation.data;
            // Get approved properties with pagination
            const { properties, total } = await this.propertyService.getApprovedProperties({ page, limit });
            // Calculate pagination metadata
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;
            res.json({
                data: properties,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });
        }
        catch (error) {
            console.error('Error getting approved properties:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to retrieve approved properties'
            });
        }
    };
    /**
     * Get a property by ID
     * Admin endpoint or client who owns the property
     */
    getPropertyById = async (req, res) => {
        try {
            // Validate property ID parameter
            const paramValidation = propertyIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property ID',
                    details: paramValidation.error.format()
                });
                return;
            }
            const { propertyId } = paramValidation.data;
            // Get property by ID
            const property = await this.propertyService.getPropertyById(propertyId);
            if (!property) {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Property not found'
                });
                return;
            }
            // Check if user has access to the property
            // Admin can access any property, client can only access their own properties
            const isAdmin = req.user?.role === 'ADMIN';
            const isClientProperty = req.user?.client?.id === property.clientId;
            if (!isAdmin && !isClientProperty) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'You do not have permission to access this property'
                });
                return;
            }
            res.json({ data: property });
        }
        catch (error) {
            console.error('Error getting property by ID:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to retrieve property'
            });
        }
    };
    /**
     * Get a property by ID if it's approved
     * Public endpoint
     */
    getApprovedPropertyById = async (req, res) => {
        try {
            // Validate property ID parameter
            const paramValidation = propertyIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property ID',
                    details: paramValidation.error.format()
                });
                return;
            }
            const { propertyId } = paramValidation.data;
            // Get approved property by ID
            const property = await this.propertyService.getApprovedPropertyById(propertyId);
            if (!property) {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Property not found or not approved'
                });
                return;
            }
            res.json({ data: property });
        }
        catch (error) {
            console.error('Error getting approved property by ID:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to retrieve property'
            });
        }
    };
    /**
     * Get properties for the authenticated client with pagination
     * Client only
     */
    getClientProperties = async (req, res) => {
        try {
            // Validate query parameters
            const queryValidation = propertyFilterSchema.omit({ status: true }).safeParse(req.query);
            if (!queryValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid query parameters',
                    details: queryValidation.error.format()
                });
                return;
            }
            const { page, limit } = queryValidation.data;
            // Check if user is a client
            const clientId = req.user?.client?.id;
            if (!clientId) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Not a client'
                });
                return;
            }
            // Get client properties with pagination
            const { properties, total } = await this.propertyService.getClientProperties(clientId, { page, limit });
            // Calculate pagination metadata
            const totalPages = Math.ceil(total / limit);
            const hasNextPage = page < totalPages;
            const hasPreviousPage = page > 1;
            res.json({
                data: properties,
                meta: {
                    total,
                    page,
                    limit,
                    totalPages,
                    hasNextPage,
                    hasPreviousPage
                }
            });
        }
        catch (error) {
            console.error('Error getting client properties:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to retrieve properties'
            });
        }
    };
    /**
     * Create a new property
     * Client only
     */
    createProperty = async (req, res) => {
        try {
            // Validate request body
            const bodyValidation = createPropertySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property data',
                    details: bodyValidation.error.format()
                });
                return;
            }
            // Check if user is a client
            const clientId = req.user?.client?.id;
            if (!clientId) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Not a client'
                });
                return;
            }
            // Create property
            const property = await this.propertyService.createProperty(clientId, bodyValidation.data, req.user?.id // Pass the userId for audit logging
            );
            res.status(201).json({
                data: property,
                message: 'Property created successfully'
            });
        }
        catch (error) {
            console.error('Error creating property:', error);
            if (error instanceof PropertyValidationError) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: error.message
                });
                return;
            }
            if (error instanceof PropertyAccessError) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to create property'
            });
        }
    };
    /**
     * Update an existing property
     * Client who owns the property or admin
     */
    updateProperty = async (req, res) => {
        try {
            // Validate property ID parameter
            const paramValidation = propertyIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property ID',
                    details: paramValidation.error.format()
                });
                return;
            }
            // Validate request body
            const bodyValidation = updatePropertySchema.safeParse(req.body);
            if (!bodyValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property data',
                    details: bodyValidation.error.format()
                });
                return;
            }
            const { propertyId } = paramValidation.data;
            // Check user role
            const isAdmin = req.user?.role === 'ADMIN';
            const clientId = isAdmin ? null : req.user?.client?.id;
            // If not admin, check if user is a client
            if (!isAdmin && !clientId) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Not authorized'
                });
                return;
            }
            // Update property
            const property = await this.propertyService.updateProperty(propertyId, clientId, bodyValidation.data, req.user?.id // Pass the userId for audit logging
            );
            if (!property) {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Property not found or not editable'
                });
                return;
            }
            res.json({
                data: property,
                message: 'Property updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating property:', error);
            if (error instanceof PropertyValidationError) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: error.message
                });
                return;
            }
            if (error instanceof PropertyAccessError) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to update property'
            });
        }
    };
    /**
     * Update a property's status
     * Admin only
     */
    updatePropertyStatus = async (req, res) => {
        try {
            // Validate property ID parameter
            const paramValidation = propertyIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property ID',
                    details: paramValidation.error.format()
                });
                return;
            }
            // Validate request body
            const bodyValidation = updatePropertyStatusSchema.safeParse(req.body);
            if (!bodyValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid status data',
                    details: bodyValidation.error.format()
                });
                return;
            }
            const { propertyId } = paramValidation.data;
            // Update property status
            const property = await this.propertyService.updatePropertyStatus(propertyId, bodyValidation.data, req.user?.id // Pass the userId for audit logging
            );
            if (!property) {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Property not found'
                });
                return;
            }
            res.json({
                data: property,
                message: `Property status updated to ${bodyValidation.data.status}`
            });
        }
        catch (error) {
            console.error('Error updating property status:', error);
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to update property status'
            });
        }
    };
    /**
     * Delete a property
     * Client who owns the property or admin
     */
    deleteProperty = async (req, res) => {
        try {
            // Validate property ID parameter
            const paramValidation = propertyIdParamSchema.safeParse(req.params);
            if (!paramValidation.success) {
                res.status(400).json({
                    error: 'ValidationError',
                    message: 'Invalid property ID',
                    details: paramValidation.error.format()
                });
                return;
            }
            const { propertyId } = paramValidation.data;
            // Check user role
            const isAdmin = req.user?.role === 'ADMIN';
            const clientId = isAdmin ? null : req.user?.client?.id;
            // If not admin, check if user is a client
            if (!isAdmin && !clientId) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: 'Not authorized'
                });
                return;
            }
            // Delete property
            const deleted = await this.propertyService.deleteProperty(propertyId, clientId, req.user?.id // Pass the userId for audit logging
            );
            if (!deleted) {
                res.status(404).json({
                    error: 'NotFound',
                    message: 'Property not found or not deletable'
                });
                return;
            }
            res.json({
                success: true,
                message: 'Property deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting property:', error);
            if (error instanceof PropertyAccessError) {
                res.status(403).json({
                    error: 'Forbidden',
                    message: error.message
                });
                return;
            }
            res.status(500).json({
                error: 'InternalServerError',
                message: 'Failed to delete property'
            });
        }
    };
}
// Create singleton instance with default Prisma client
export const propertyController = new PropertyController(new PrismaClient());
//# sourceMappingURL=property.controller.js.map