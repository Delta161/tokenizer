import express from 'express';
import { getInvestor } from '../controllers/investorController.js';
import { requireAuth, requireOwnershipOrAdmin } from '../src/modules/auth/index.js';
const router = express.Router();
// Get investor by ID - requires authentication and ownership or admin role
router.get('/:id', requireAuth, requireOwnershipOrAdmin('id'), getInvestor);
export default router;
//# sourceMappingURL=investors.js.map