import { Response } from 'express';
import { AuthenticatedRequest } from '../../accounts/types/auth.types.js';
import { VisitService } from '../services/visit.service.js';
/**
 * Controller class for handling visit-related HTTP requests
 */
export declare class VisitController {
    private visitService;
    /**
     * Creates a new instance of VisitController
     * @param visitService - The VisitService instance
     */
    constructor(visitService: VisitService);
    /**
     * Handles the POST /visits request to create a new visit
     * @param req - The HTTP request object
     * @param res - The HTTP response object
     */
    createVisit: (req: AuthenticatedRequest, res: Response) => Promise<void>;
}
//# sourceMappingURL=visit.controller.d.ts.map