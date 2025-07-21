/**
 * Property Controller
 * Handles HTTP requests for property operations
 */

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PropertyService, PropertyAccessError, PropertyValidationError } from '../services/property.service';
import {
  createPropertySchema,
  updatePropertySchema,
  updatePropertyStatusSchema,
  propertyIdParamSchema,
  propertyFilterSchema
} from '../validators/property.validators';

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export class PropertyController {
  private propertyService: PropertyService;

  constructor(prisma: PrismaClient) {
    this.propertyService = new PropertyService(prisma);
  }

  /**
   * Get all properties with filtering and pagination
   * Admin only
   */
  getProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      // Check if user is admin
      if (!req.user || req.user.role !== 'ADMIN') {
        res.status(403).json({
          error: 'AccessDenied',
          message: 'Only administrators can access all properties'
        });
        return;
      }

      const properties = await this.propertyService.getProperties({
        status,
        pagination: { page, limit },
        sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
      });

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Error fetching properties:', error);
      next(error);
    }
  };

  /**
   * Get public properties (available to all users)
   */
  getPublicProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

      const { page, limit, sortBy, sortDirection } = queryValidation.data;

      const properties = await this.propertyService.getPublicProperties({
        pagination: { page, limit },
        sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
      });

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Error fetching public properties:', error);
      next(error);
    }
  };

  /**
   * Get properties for a specific client
   */
  getClientProperties = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

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
      const clientId = req.params.clientId;

      // Check access permissions
      try {
        await this.propertyService.checkClientAccess(clientId, req.user);
      } catch (error) {
        if (error instanceof PropertyAccessError) {
          res.status(403).json({
            error: 'AccessDenied',
            message: error.message
          });
          return;
        }
        throw error;
      }

      const properties = await this.propertyService.getClientProperties(clientId, {
        status,
        pagination: { page, limit },
        sort: sortBy && sortDirection ? { field: sortBy, direction: sortDirection } : undefined
      });

      res.status(200).json({
        success: true,
        data: properties
      });
    } catch (error) {
      console.error('Error fetching client properties:', error);
      next(error);
    }
  };

  /**
   * Get a property by ID
   */
  getPropertyById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate property ID
      const idValidation = propertyIdParamSchema.safeParse(req.params);
      if (!idValidation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid property ID',
          details: idValidation.error.format()
        });
        return;
      }

      const propertyId = idValidation.data.id;

      try {
        // Check access permissions if user is authenticated
        if (req.user) {
          await this.propertyService.checkPropertyAccess(propertyId, req.user);
        }

        const property = await this.propertyService.getPropertyById(propertyId, !!req.user);

        if (!property) {
          res.status(404).json({
            error: 'NotFound',
            message: 'Property not found'
          });
          return;
        }

        res.status(200).json({
          success: true,
          data: property
        });
      } catch (error) {
        if (error instanceof PropertyAccessError) {
          res.status(403).json({
            error: 'AccessDenied',
            message: error.message
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      next(error);
    }
  };

  /**
   * Create a new property
   * Client only
   */
  createProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      // Validate request body
      const validation = createPropertySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid property data',
          details: validation.error.format()
        });
        return;
      }

      try {
        const property = await this.propertyService.createProperty(validation.data, req.user);

        res.status(201).json({
          success: true,
          data: property,
          message: 'Property created successfully'
        });
      } catch (error) {
        if (error instanceof PropertyAccessError) {
          res.status(403).json({
            error: 'AccessDenied',
            message: error.message
          });
          return;
        }
        if (error instanceof PropertyValidationError) {
          res.status(400).json({
            error: 'ValidationError',
            message: error.message
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error creating property:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Update a property
   * Client (owner) or Admin only
   */
  updateProperty = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      // Validate property ID
      const idValidation = propertyIdParamSchema.safeParse(req.params);
      if (!idValidation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid property ID',
          details: idValidation.error.format()
        });
        return;
      }

      // Validate request body
      const validation = updatePropertySchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid property data',
          details: validation.error.format()
        });
        return;
      }

      const propertyId = idValidation.data.id;

      try {
        // Check access permissions
        await this.propertyService.checkPropertyUpdateAccess(propertyId, req.user);

        const property = await this.propertyService.updateProperty(propertyId, validation.data);

        res.status(200).json({
          success: true,
          data: property,
          message: 'Property updated successfully'
        });
      } catch (error) {
        if (error instanceof PropertyAccessError) {
          res.status(403).json({
            error: 'AccessDenied',
            message: error.message
          });
          return;
        }
        if (error instanceof PropertyValidationError) {
          res.status(400).json({
            error: 'ValidationError',
            message: error.message
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error updating property:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };

  /**
   * Update property status
   * Admin only
   */
  updatePropertyStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        });
        return;
      }

      // Check if user is admin
      if (req.user.role !== 'ADMIN') {
        res.status(403).json({
          error: 'AccessDenied',
          message: 'Only administrators can update property status'
        });
        return;
      }

      // Validate property ID
      const idValidation = propertyIdParamSchema.safeParse(req.params);
      if (!idValidation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid property ID',
          details: idValidation.error.format()
        });
        return;
      }

      // Validate request body
      const validation = updatePropertyStatusSchema.safeParse(req.body);
      if (!validation.success) {
        res.status(400).json({
          error: 'ValidationError',
          message: 'Invalid status data',
          details: validation.error.format()
        });
        return;
      }

      const propertyId = idValidation.data.id;
      const { status } = validation.data;

      const property = await this.propertyService.updatePropertyStatus(propertyId, status);

      res.status(200).json({
        success: true,
        data: property,
        message: `Property status updated to ${status}`
      });
    } catch (error) {
      console.error('Error updating property status:', error instanceof Error ? error.message : 'Unknown error');
      next(error);
    }
  };
}