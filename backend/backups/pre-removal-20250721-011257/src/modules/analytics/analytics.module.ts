import { PrismaClient } from '@prisma/client';
import { Express } from 'express';
import { initAnalyticsModule } from './index.js';

/**
 * Registers the analytics module with the Express application
 * @param app - The Express application instance
 * @param prisma - The Prisma client instance
 */
export function registerAnalyticsModule(app: Express, prisma: PrismaClient): void {
  // Initialize the analytics module
  const { 
    auditRouter, 
    flagsRouter, 
    visitRouter, 
    visitAnalyticsRouter 
  } = initAnalyticsModule(prisma);

  // Register the routers with the Express application
  app.use('/api/analytics/audit', auditRouter);
  app.use('/api/analytics/flags', flagsRouter);
  app.use('/api/analytics/visits', visitRouter);
  app.use('/api/analytics/visit-analytics', visitAnalyticsRouter);

  console.log('Analytics module registered');
}