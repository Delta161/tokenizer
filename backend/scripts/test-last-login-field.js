// test-last-login-field.js
// Script to test if the lastLoginAt field is properly defined in the User model

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function testLastLoginField() {
  try {
    console.log('Testing lastLoginAt field...');
    
    // Check database connection
    await prisma.$connect();
    console.log('Database connection successful');
    
    // Get a user from the database
    const user = await prisma.user.findFirst();
    console.log('Found user:', user ? user.id : 'No users found');
    
    if (user) {
      // Update the lastLoginAt field
      const now = new Date();
      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: now }
      });
      
      console.log('Updated user lastLoginAt:', updatedUser.lastLoginAt);
      console.log('Update successful:', updatedUser.lastLoginAt ? true : false);
    }
    
    console.log('Test completed successfully');
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testLastLoginField();