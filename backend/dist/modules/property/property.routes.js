import { Router } from 'express';
import { requireAuth } from '../auth/requireAuth.js';
import { requireClient, requireAdmin } from '../auth/requireRole.js';
import { PropertyController } from './property.controller.js';
export function createPropertyRoutes(prisma) {
    const router = Router();
    const controller = new PropertyController(prisma);
    // Public (Investors)
    router.get('/', controller.getAllApproved);
    router.get('/:id', controller.getByIdIfApproved);
    // Client (ROLE = CLIENT)
    router.get('/my', requireAuth, requireClient, controller.getMyProperties);
    router.post('/create', requireAuth, requireClient, controller.create);
    router.patch('/:id', requireAuth, requireClient, controller.update);
    router.delete('/:id', requireAuth, requireClient, controller.delete);
    // Admin (ROLE = ADMIN)
    router.get('/admin/properties', requireAuth, requireAdmin, controller.getAllAdmin);
    router.patch('/admin/properties/:id/status', requireAuth, requireAdmin, controller.updateStatus);
    return router;
}
export default createPropertyRoutes;
//# sourceMappingURL=property.routes.js.map