import { Request, Response } from 'express';
import { AdminService } from './admin.service.js';
import { AuthenticatedRequest } from '../auth/auth.middleware.js';
export declare class AdminController {
    private adminService;
    constructor(adminService: AdminService);
    /**
     * Get all users with optional filtering
     */
    getUsers: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get user by ID
     */
    getUserById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Update user role
     */
    updateUserRole: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Update user active status
     */
    updateUserStatus: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get all properties with optional filtering
     */
    getProperties: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get property by ID
     */
    getPropertyById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Moderate a property (approve/reject)
     */
    moderateProperty: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get all tokens with optional filtering
     */
    getTokens: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get token by ID
     */
    getTokenById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get all KYC records with optional filtering
     */
    getKycRecords: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Get KYC record by ID
     */
    getKycRecordById: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
    /**
     * Send broadcast notification to users
     */
    sendBroadcastNotification: (req: AuthenticatedRequest, res: Response) => Promise<Response<any, Record<string, any>>>;
}
//# sourceMappingURL=admin.controller.d.ts.map