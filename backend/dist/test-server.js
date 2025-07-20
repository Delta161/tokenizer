import express from 'express';
import { PrismaClient } from '@prisma/client';
import { initDocumentModule, mountDocumentRoutes } from './src/modules/documents/index.js';
const app = express();
// Initialize Prisma client
const prisma = new PrismaClient();
// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize document module
const documentModule = initDocumentModule(prisma);
// Mount document routes
mountDocumentRoutes(app, '/api/documents');
// Simple test route
app.get('/', (req, res) => {
    res.json({ message: 'Document API is running' });
});
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
//# sourceMappingURL=test-server.js.map