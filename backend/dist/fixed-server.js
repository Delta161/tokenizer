import express from 'express';
import { PrismaClient } from '@prisma/client';
const app = express();
const prisma = new PrismaClient();
// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Simple test route
app.get('/', (req, res) => {
    console.log('Root endpoint accessed');
    res.json({ message: 'API is running' });
});
// Test route to get documents
app.get('/api/documents', (req, res) => {
    console.log('Documents endpoint accessed');
    // Return mock data
    const mockDocuments = [
        { id: '1', title: 'Mock Document 1', content: 'This is a mock document', createdAt: new Date() },
        { id: '2', title: 'Mock Document 2', content: 'This is another mock document', createdAt: new Date() }
    ];
    res.json({
        success: true,
        message: 'Mock documents returned',
        data: mockDocuments
    });
});
// Test route to get soft-deleted documents
app.get('/api/documents/deleted', (req, res) => {
    console.log('Deleted documents endpoint accessed');
    // Return mock deleted documents
    const mockDeletedDocuments = [
        { id: '3', title: 'Deleted Document 1', content: 'This is a deleted mock document', createdAt: new Date(), deletedAt: new Date() },
        { id: '4', title: 'Deleted Document 2', content: 'This is another deleted mock document', createdAt: new Date(), deletedAt: new Date() }
    ];
    res.json({
        success: true,
        message: 'Mock deleted documents returned',
        data: mockDeletedDocuments
    });
});
// Test route for audit logs
app.get('/api/audit/logs', async (req, res) => {
    console.log('Audit logs endpoint accessed');
    try {
        const auditLogs = await prisma.auditLogEntry.findMany({
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json({
            success: true,
            message: 'Audit logs retrieved',
            data: auditLogs
        });
    }
    catch (error) {
        console.error('Error retrieving audit logs:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit logs',
            error: error.message
        });
    }
});
// Test route for specific audit log
app.get('/api/audit/logs/:id', async (req, res) => {
    console.log(`Audit log endpoint accessed for ID: ${req.params.id}`);
    try {
        const auditLog = await prisma.auditLogEntry.findUnique({
            where: {
                id: req.params.id
            },
            include: {
                user: true
            }
        });
        if (!auditLog) {
            return res.status(404).json({
                success: false,
                message: `Audit log with ID ${req.params.id} not found`
            });
        }
        res.json({
            success: true,
            message: 'Audit log retrieved',
            data: auditLog
        });
    }
    catch (error) {
        console.error('Error retrieving audit log:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to retrieve audit log',
            error: error.message
        });
    }
});
const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Fixed server running on port ${PORT}`);
});
//# sourceMappingURL=fixed-server.js.map