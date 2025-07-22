/**
 * Migration script to add lastLoginAt field to User model
 * Run this script when the database is available
 */

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function addLastLoginField() {
  try {
    console.log('Starting migration to add lastLoginAt field...');
    
    // Check if the database is accessible
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connection successful');
    
    // Execute the migration
    // This assumes you've already updated the schema.prisma file
    // and generated the client, but haven't run the migration
    console.log('Running migration...');
    
    // You can add custom migration logic here if needed
    // For example, initializing the lastLoginAt field for existing users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to update`);
    
    // Update each user with a lastLoginAt value
    for (const user of users) {
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: user.updatedAt } // Initialize with updatedAt as a reasonable default
      });
    }
    
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addLastLoginField()
  .then(() => console.log('Script execution completed'))
  .catch(error => console.error('Script execution failed:', error));