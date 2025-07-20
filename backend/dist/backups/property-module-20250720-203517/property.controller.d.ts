/**
 * Property Controller
 * Handles HTTP requests for property operations
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}
export declare class PropertyController {
    private propertyService;
    constructor(prisma: PrismaClient);
    /**
     * Get all properties with filtering and pagination
     * Admin only
     */
    getProperties: (req: Request, res: Response) => Promise<void>;
    /**
     * Get all approved properties with pagination
     * Public endpoint
     */
    getApprovedProperties: (req: Request, res: Response) => Promise<void>;
    /**
     * Get a property by ID
     * Admin endpoint or client who owns the property
     */
    getPropertyById: (req: Request, res: Response) => Promise<void>;
    /**
     * Get a property by ID if it's approved
     * Public endpoint
     */
    getApprovedPropertyById: (req: Request, res: Response) => Promise<void>;
    /**
     * Get properties for the authenticated client with pagination
     * Client only
     */
    getClientProperties: (req: Request, res: Response) => Promise<void>;
    /**
     * Create a new property
     * Client only
     */
    createProperty: (req: Request, res: Response) => Promise<void>;
    /**
     * Update an existing property
     * Client who owns the property or admin
     */
    updateProperty: (req: Request, res: Response) => Promise<void>;
    /**
     * Update a property's status
     * Admin only
     */
    updatePropertyStatus: (req: Request, res: Response) => Promise<void>;
    /**
     * Delete a property
     * Client who owns the property or admin
     */
    deleteProperty: (req: Request, res: Response) => Promise<void>;
}
export declare const propertyController: PropertyController;
//# sourceMappingURL=property.controller.d.ts.map