import { PrismaClient, ActionType } from '@prisma/client';
/**
 * Simple script to test the Audit Log functionality
 * Run with: node scripts/test-audit-log.js
 */
const prisma = new PrismaClient();
async function main() {
    console.log('Creating test audit log entries...');
    try {
        // Create a test user if it doesn't exist
        let testUser = await prisma.user.findFirst({
            where: { email: 'test@example.com' }
        });
        if (!testUser) {
            console.log('Creating test user...');
            testUser = await prisma.user.create({
                data: {
                    email: 'test@example.com',
                    fullName: 'Test User',
                    providerId: 'test-provider-id',
                    role: 'ADMIN',
                    authProvider: 'GOOGLE'
                }
            });
            console.log(`Created test user with ID: ${testUser.id}`);
        }
        // Create a few audit log entries
        const auditLog1 = await prisma.auditLogEntry.create({
            data: {
                userId: testUser.id,
                actionType: ActionType.USER_CREATED,
                entityType: 'User',
                entityId: testUser.id,
                metadata: { source: 'test-script', details: 'Testing audit log creation' }
            }
        });
        console.log(`Created audit log entry: ${auditLog1.id}`);
        const auditLog2 = await prisma.auditLogEntry.create({
            data: {
                userId: testUser.id,
                actionType: ActionType.PROPERTY_CREATED,
                entityType: 'Property',
                entityId: 'test-property-id',
                metadata: { source: 'test-script', propertyName: 'Test Property' }
            }
        });
        console.log(`Created audit log entry: ${auditLog2.id}`);
        // Retrieve and display audit logs
        const auditLogs = await prisma.auditLogEntry.findMany({
            include: {
                user: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        console.log('\nRetrieved audit logs:');
        auditLogs.forEach(log => {
            console.log(`ID: ${log.id}`);
            console.log(`Action: ${log.actionType}`);
            console.log(`Entity: ${log.entityType} (${log.entityId})`);
            console.log(`User: ${log.user?.email || 'None'}`);
            console.log(`Created: ${log.createdAt}`);
            console.log(`Metadata: ${JSON.stringify(log.metadata)}`);
            console.log('---');
        });
        console.log('Audit log test completed successfully!');
    }
    catch (error) {
        console.error('Error testing audit logs:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
main();
//# sourceMappingURL=test-audit-log.js.map