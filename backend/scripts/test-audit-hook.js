// Using ES modules
import { PrismaClient, ActionType } from '@prisma/client';

// Since we can't directly import TypeScript files in Node.js without transpilation,
// we'll create a simplified version of the createAuditLog function for this test

/**
 * Simple script to test the Audit Log hook functionality
 * Run with: node scripts/test-audit-hook.js
 */

const prisma = new PrismaClient();

// Simplified version of the createAuditLog function based on the original in hooks/createAuditLog.ts
async function createAuditLog(params) {
  const { userId, actionType, entityType, entityId, metadata } = params;
  
  try {
    return await prisma.auditLogEntry.create({
      data: {
        userId,
        actionType,
        entityType,
        entityId,
        metadata
      }
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
    // Don't throw - audit logging should not break main functionality
    return null;
  }
}

async function main() {
  console.log('Testing audit log hook...');
  
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
    
    // Example 1: Record a document upload action
    console.log('Recording document upload action...');
    await createAuditLog({
      userId: testUser.id,
      actionType: ActionType.DOCUMENT_UPLOADED,
      entityType: 'Document',
      entityId: 'test-document-id',
      metadata: { 
        documentName: 'test-document.pdf',
        documentSize: 1024,
        documentType: 'application/pdf'
      }
    });
    
    // Example 2: Record a property update action
    console.log('Recording property update action...');
    await createAuditLog({
      userId: testUser.id,
      actionType: ActionType.PROPERTY_UPDATED,
      entityType: 'Property',
      entityId: 'test-property-id',
      metadata: { 
        propertyName: 'Test Property',
        updatedFields: ['price', 'description'],
        previousValues: {
          price: 100000,
          description: 'Old description'
        },
        newValues: {
          price: 120000,
          description: 'Updated description'
        }
      }
    });
    
    // Retrieve and display audit logs
    const auditLogs = await prisma.auditLogEntry.findMany({
      include: {
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log('\nRetrieved latest audit logs:');
    auditLogs.forEach(log => {
      console.log(`ID: ${log.id}`);
      console.log(`Action: ${log.actionType}`);
      console.log(`Entity: ${log.entityType} (${log.entityId})`);
      console.log(`User: ${log.user?.email || 'None'}`);
      console.log(`Created: ${log.createdAt}`);
      console.log(`Metadata: ${JSON.stringify(log.metadata)}`);
      console.log('---');
    });
    
    console.log('Audit log hook test completed successfully!');
  } catch (error) {
    console.error('Error testing audit log hook:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();