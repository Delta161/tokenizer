import { Request, Response } from 'express';
/**
 * Controller for feature flags API endpoints
 */
export declare const flagsController: {
    /**
     * Get all feature flags
     */
    getAll(req: Request, res: Response): Promise<void>;
    /**
     * Get a specific feature flag by key
     */
    getByKey(req: Request, res: Response): Promise<void>;
    /**
     * Update a feature flag
     */
    update(req: Request, res: Response): Promise<void>;
};
//# sourceMappingURL=flags.controller.d.ts.map