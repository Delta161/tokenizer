/**
 * Client Module Barrel File
 * 
 * This file exports all the components of the Client module
 * for clean and organized imports throughout the application.
 */

import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

// Import and re-export controllers
export * from './controllers';

// Import and re-export services
export * from './services';

// Import and re-export routes
export * from './routes';

// Import and re-export types
export * from './types';

// Import and re-export validators
export * from './validators';

// Import and re-export utils
export * from './utils';

/**
 * Re-export ClientStatus enum from Prisma for convenience
 * This allows other modules to import the enum without directly importing from Prisma
 */
export { ClientStatus } from '@prisma/client';

/**
 * Initialize the Client module
 * @param prisma PrismaClient instance (optional, will create new instance if not provided)
 * @returns Object containing routes and services
 */
export function initClientModule(prisma?: PrismaClient): {
  router: Router;
  service: any;
  controller: any;
} {
  // Import controller, service, and routes directly to ensure they're loaded
  const { ClientController } = require('./controllers/client.controller');
  const { ClientService } = require('./services/client.service');
  const { createClientRoutes } = require('./routes/client.routes');
  
  // Create service instance
  const clientService = new ClientService(prisma);
  
  // Create controller instance
  const clientController = new ClientController(prisma);
  
  // Create routes
  const router = createClientRoutes();
  
  return {
    router,
    service: clientService,
    controller: clientController
  };
}