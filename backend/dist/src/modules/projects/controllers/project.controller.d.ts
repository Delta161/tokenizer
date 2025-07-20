/**
 * Project Controller
 *
 * This controller handles operations that combine client, property, and token data
 * into unified project resources.
 */
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
export declare class ProjectController {
    private prisma;
    private clientController;
    private propertyController;
    private tokenController;
    constructor(prisma: PrismaClient);
    /**
   * Get a list of projects (properties with their associated client and token data)
   */
    listProjects: (req: Request, res: Response) => Promise<void>;
    /**
   * Get a single project by property ID
   */
    getProjectById: (req: Request, res: Response) => Promise<void>;
    /**
   * Get featured projects for public display
   */
    getFeaturedProjects: (req: Request, res: Response) => Promise<void>;
}
//# sourceMappingURL=project.controller.d.ts.map