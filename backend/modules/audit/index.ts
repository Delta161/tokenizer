import { Router } from 'express';
import { auditRoutes } from './routes/audit.routes';

const auditRouter = Router();
auditRouter.use('/audit', auditRoutes);

export { auditRouter };