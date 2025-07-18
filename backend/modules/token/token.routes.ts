import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { requireAuth } from '../auth/requireAuth.js';
import { requireAdmin, requireInvestor } from '../auth/requireRole.js';
import { TokenController } from './token.controller.js';

export function createTokenRoutes(prisma: PrismaClient): Router {
  const router = Router();
  const controller = new TokenController(prisma);

  // Admin endpoints
  router.post('/tokens/create', requireAuth, requireAdmin, controller.create);
  router.get('/tokens', requireAuth, requireAdmin, controller.getAll);
  router.get('/tokens/:id', requireAuth, requireAdmin, controller.getById);
  router.patch('/tokens/:id', requireAuth, requireAdmin, controller.update);
  router.delete('/tokens/:id', requireAuth, requireAdmin, controller.delete);

  // Investor endpoints
  router.get('/tokens/public', requireAuth, requireInvestor, controller.getAllPublic);

  return router;
}

export default createTokenRoutes;