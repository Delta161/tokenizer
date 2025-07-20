import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../auth/auth.middleware';
/**
 * Middleware to require verified KYC status
 * This middleware should be used after requireAuth
 */
export declare const requireKycVerified: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=kyc.middleware.d.ts.map