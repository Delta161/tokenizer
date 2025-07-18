import { PrismaClient } from '@prisma/client';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Prisma client
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Applying KYC provider migration...');
    
    // Run Prisma migration
    const migrationCommand = 'npx prisma migrate dev --name add_kyc_provider_fields';
    console.log(`Running: ${migrationCommand}`);
    execSync(migrationCommand, { stdio: 'inherit', cwd: join(__dirname, '..') });
    
    // Generate Prisma client
    const generateCommand = 'npx prisma generate';
    console.log(`Running: ${generateCommand}`);
    execSync(generateCommand, { stdio: 'inherit', cwd: join(__dirname, '..') });
    
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();