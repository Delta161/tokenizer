import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { PropertyService } from './property.service.js';
import {
  propertyCreateSchema,
  propertyUpdateSchema,
  propertyStatusUpdateSchema
} from './property.validators.js';
import {
  PropertyCreateDTO,
  PropertyUpdateDTO,
  PropertyStatusUpdateDTO
} from './property.types.js';
import { AuthenticatedRequest } from '../auth/requireAuth.js';

export class PropertyController {
  constructor(private prisma: PrismaClient) {}

  private getService() {
    return new PropertyService(this.prisma);
  }

  getAllApproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const properties = await this.getService().getAllApproved(req.query);
      res.json({ success: true, data: properties });
    } catch (error) {
      next(error);
    }
  };

  getByIdIfApproved = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const property = await this.getService().getByIdIfApproved(req.params.id);
      if (!property) return res.status(404).json({ success: false, error: 'NotFound', message: 'Property not found' });
      res.json({ success: true, data: property });
    } catch (error) {
      next(error);
    }
  };

  getMyProperties = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.client?.id;
      if (!clientId) return res.status(403).json({ success: false, error: 'Forbidden', message: 'Not a client' });
      const properties = await this.getService().getMyProperties(clientId);
      res.json({ success: true, data: properties });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new property
   * @param req Request with authenticated user and property data
   * @param res Response
   * @param next Next function
   */
  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = propertyCreateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parse.error.message 
        });
      }
      
      const clientId = req.user?.client?.id;
      if (!clientId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Forbidden', 
          message: 'Not a client' 
        });
      }
      
      // Pass the userId for audit logging
      const property = await this.getService().create(
        clientId, 
        parse.data as PropertyCreateDTO,
        req.user?.id // Pass the userId for audit logging
      );
      
      res.status(201).json({ 
        success: true, 
        data: property,
        message: 'Property created successfully'
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update an existing property
   * @param req Request with authenticated user and property data
   * @param res Response
   * @param next Next function
   */
  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = propertyUpdateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parse.error.message 
        });
      }
      
      const clientId = req.user?.client?.id;
      if (!clientId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Forbidden', 
          message: 'Not a client' 
        });
      }
      
      // Pass the userId for audit logging
      const updated = await this.getService().update(
        clientId, 
        req.params.id, 
        parse.data as PropertyUpdateDTO,
        req.user?.id // Pass the userId for audit logging
      );
      
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Property not found or not editable' 
        });
      }
      
      res.json({ 
        success: true, 
        data: updated, 
        message: 'Property updated successfully' 
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a property
   * @param req Request with authenticated user and property ID
   * @param res Response
   * @param next Next function
   */
  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const clientId = req.user?.client?.id;
      if (!clientId) {
        return res.status(403).json({ 
          success: false, 
          error: 'Forbidden', 
          message: 'Not a client' 
        });
      }
      
      // Pass the userId for audit logging
      const deleted = await this.getService().delete(
        clientId, 
        req.params.id,
        req.user?.id // Pass the userId for audit logging
      );
      
      if (!deleted) {
        return res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Property not found or not deletable' 
        });
      }
      
      res.json({ 
        success: true, 
        message: 'Property deleted successfully' 
      });
    } catch (error) {
      next(error);
    }
  };

  getAllAdmin = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const properties = await this.getService().getAllAdmin(req.query);
      res.json({ success: true, data: properties });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update the status of a property
   * @param req Request with authenticated user and property ID
   * @param res Response
   * @param next Next function
   */
  updateStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const parse = propertyStatusUpdateSchema.safeParse(req.body);
      if (!parse.success) {
        return res.status(400).json({ 
          success: false, 
          error: 'ValidationError', 
          message: parse.error.message 
        });
      }
      
      // Pass the userId for audit logging
      const updated = await this.getService().updateStatus(
        req.params.id, 
        parse.data as PropertyStatusUpdateDTO,
        req.user?.id // Pass the userId for audit logging
      );
      
      if (!updated) {
        return res.status(404).json({ 
          success: false, 
          error: 'NotFound', 
          message: 'Property not found' 
        });
      }
      
      res.json({ 
        success: true, 
        data: updated, 
        message: `Property status updated to ${parse.data.status}` 
      });
    } catch (error) {
      next(error);
    }
  };
}