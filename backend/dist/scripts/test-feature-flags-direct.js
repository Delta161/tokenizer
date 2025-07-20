/**
 * Direct test for Feature Flags using Prisma client
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function testFeatureFlags() {
    try {
        console.log('Testing Feature Flags directly with Prisma...');
        // Test 1: Create a test flag
        console.log('\nTest 1: Create a test flag');
        const testFlag = await prisma.featureFlag.upsert({
            where: { key: 'TEST_FLAG_DIRECT' },
            update: { enabled: true },
            create: { key: 'TEST_FLAG_DIRECT', enabled: true },
        });
        console.log('Created flag:', testFlag);
        // Test 2: Get the flag
        console.log('\nTest 2: Get the flag');
        const flag = await prisma.featureFlag.findUnique({
            where: { key: 'TEST_FLAG_DIRECT' }
        });
        console.log('Flag details:', flag);
        // Test 3: List all flags
        console.log('\nTest 3: List all flags');
        const allFlags = await prisma.featureFlag.findMany();
        console.log('All flags:', allFlags);
        // Test 4: Update the flag
        console.log('\nTest 4: Update the flag');
        const updatedFlag = await prisma.featureFlag.update({
            where: { key: 'TEST_FLAG_DIRECT' },
            data: { enabled: false },
        });
        console.log('Updated flag:', updatedFlag);
        console.log('\nFeature Flags direct tests completed successfully!');
    }
    catch (error) {
        console.error('Error testing Feature Flags directly:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the test
testFeatureFlags();
//# sourceMappingURL=test-feature-flags-direct.js.map