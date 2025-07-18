import { PrismaClient } from '@prisma/client';

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting Prisma debug...');
    
    // Check what's available in the Prisma client
    console.log('Prisma client keys:', Object.keys(prisma));
    
    // Check if there are any models available
    if (prisma.$on) {
      console.log('Prisma client has $on method');
    }
    
    // Try to access some models directly
    console.log('Document model exists:', !!prisma.document);
    console.log('User model exists:', !!prisma.user);
    console.log('Property model exists:', !!prisma.property);
    
    // Try to list all models
    console.log('Prisma dmmf:', prisma._dmmf ? 'Available' : 'Not available');
    if (prisma._dmmf && prisma._dmmf.modelMap) {
      console.log('Available models in dmmf:', Object.keys(prisma._dmmf.modelMap));
    }
    
    // Try a raw query to check if the Document table exists
    try {
      console.log('Testing if Document table exists...');
      const tableCheck = await prisma.$queryRaw`SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'Document'
      )`;
      console.log('Table check result:', tableCheck);
    } catch (queryError) {
      console.error('Error checking table:', queryError);
    }
    
    // Try to list all tables in the database
    try {
      console.log('Listing all tables in the database...');
      const tables = await prisma.$queryRaw`SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'`;
      console.log('Tables in database:', tables);
    } catch (queryError) {
      console.error('Error listing tables:', queryError);
    }
    
  } catch (error) {
    console.error('Error in Prisma debug:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();