import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
/**
 * Create and configure the documents router
 * @param prisma - PrismaClient instance
 * @returns Configured Express router
 */
export declare function createDocumentsRouter(prisma?: PrismaClient): Router;
/**
 * Mount the documents router to an existing Express router
 * @param app - Express router to mount on
 * @param path - Path to mount the router at
 * @param prisma - PrismaClient instance
 * @returns The mounted router
 */
export declare function mountDocumentsRoutes(app: Router, path?: string, prisma?: PrismaClient): Router;
//# sourceMappingURL=documents.routes.d.ts.map