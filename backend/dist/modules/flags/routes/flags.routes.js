import { Router } from 'express';
import { flagsController } from '../controllers/flags.controller';
import { requireAuth } from '../../auth/requireAuth';
import { requireRole } from '../../auth/requireRole';
import { validateBody, validateParams } from '../utils/validation';
import { UpdateFlagSchema, FlagKeyParamSchema } from '../validators/flags.validators';
const router = Router();
// Admin CRUD for flags
router.get('/admin/flags', requireAuth, requireRole('ADMIN'), flagsController.getAll);
router.patch('/admin/flags/:key', requireAuth, requireRole('ADMIN'), validateParams(FlagKeyParamSchema), validateBody(UpdateFlagSchema), flagsController.update);
// Client-facing read endpoint
router.get('/flags', requireAuth, flagsController.getAll);
export default router;
//# sourceMappingURL=flags.routes.js.map