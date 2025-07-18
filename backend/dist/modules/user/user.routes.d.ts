import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
/**
 * User routes configuration
 * All routes require authentication via OAuth 2.0
 */
export declare const createUserRoutes: (prisma: PrismaClient) => Router;
/**
 * Default export for convenience
 */
export default createUserRoutes;
//# sourceMappingURL=user.routes.d.ts.map