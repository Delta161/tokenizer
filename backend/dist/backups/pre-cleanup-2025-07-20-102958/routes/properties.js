import express from 'express';
import { createProperty } from '../controllers/propertyController.js';
const router = express.Router();
// POST /api/properties/create
router.post('/create', createProperty);
export default router;
//# sourceMappingURL=properties.js.map