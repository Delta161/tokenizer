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
     * Get public properties (available to all users)
     */
    getPublicProperties: (req: Request, res: Response) => Promise<void>;
    /**
     * Get properties for a specific client
     */
    getClientProperties: (req: Request, res: Response) => Promise<void>;
    /**
     * Get a property by ID
     */
    getPropertyById: (req: Request, res: Response) => Promise<void>;
    /**
     * Create a new property
     * Client only
     */
    createProperty: (req: Request, res: Response) => Promise<void>;
    /**
     * Update a property
     * Client (owner) or Admin only
     */
    updateProperty: (req: Request, res: Response) => Promise<void>;
    /**
     * Update property status
     * Admin only
     */
    updatePropertyStatus: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=property.controller.d.ts.map