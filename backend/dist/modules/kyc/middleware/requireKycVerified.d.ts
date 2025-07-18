import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../auth/requireAuth.js';
/**
 * Middleware to require verified KYC status
 * This middleware should be used after requireAuth
 */
export declare const requireKycVerified: (req: AuthenticatedRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=requireKycVerified.d.ts.map