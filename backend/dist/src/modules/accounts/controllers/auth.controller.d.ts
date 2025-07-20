/**
 * Auth Controller
 * Handles HTTP requests for authentication
 */
import { Request, Response } from 'express';
export declare class AuthController {
    /**
     * Register a new user
     */
    register(req: Request, res: Response): Promise<void>;
    /**
     * Login a user
     */
    login(req: Request, res: Response): Promise<void>;
    /**
     * Get user profile
     */
    getProfile(req: Request, res: Response): Promise<void>;
    /**
     * Verify JWT token
     */
    verifyToken(req: Request, res: Response): Promise<void>;
    /**
     * Handle OAuth authentication success
     */
    handleOAuthSuccess(req: Request, res: Response): Promise<void>;
    /**
     * Handle OAuth authentication error
     */
    handleOAuthError(req: Request, res: Response): Promise<void>;
    /**
     * Logout user
     */
    logout(req: Request, res: Response): Promise<void>;
    /**
     * Refresh access token using refresh token
     */
    refreshToken(req: Request, res: Response): Promise<void>;
    /**
     * Health check for auth service
     */
    healthCheck(req: Request, res: Response): Promise<void>;
}
export declare const authController: AuthController;
//# sourceMappingURL=auth.controller.d.ts.map