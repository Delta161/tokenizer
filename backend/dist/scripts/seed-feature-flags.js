/**
 * Seed script for Feature Flags
 *
 * This script creates initial feature flags in the database
 */
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function seedFeatureFlags() {
    try {
        console.log('Seeding feature flags...');
        // Define initial feature flags
        const featureFlags = [
            {
                key: 'NEW_EXAMPLE_FEATURE',
                enabled: false,
                description: 'Enables the new example feature with enhanced functionality'
            },
            {
                key: 'AB_TEST_VARIANT_B',
                enabled: false,
                description: 'Shows variant B in A/B testing'
            },
            {
                key: 'DARK_MODE',
                enabled: true,
                description: 'Enables dark mode in the UI'
            },
            {
                key: 'ADVANCED_ANALYTICS',
                enabled: false,
                description: 'Enables advanced analytics features'
            },
            {
                key: 'BETA_FEATURES',
                enabled: false,
                description: 'Enables all beta features'
            },
            {
                key: 'ROLLOUT_USER_SEGMENT_0',
                enabled: true,
                description: 'Enables features for user segment 0 (10% of users)'
            },
            {
                key: 'ROLLOUT_USER_SEGMENT_1',
                enabled: false,
                description: 'Enables features for user segment 1 (10% of users)'
            },
            {
                key: 'ROLLOUT_USER_SEGMENT_2',
                enabled: false,
                description: 'Enables features for user segment 2 (10% of users)'
            },
            {
                key: 'ENHANCED_SECURITY',
                enabled: true,
                description: 'Enables enhanced security features'
            },
            {
                key: 'NEW_DASHBOARD',
                enabled: false,
                description: 'Enables the new dashboard UI'
            }
        ];
        // Create or update each feature flag
        for (const flag of featureFlags) {
            const result = await prisma.featureFlag.upsert({
                where: { key: flag.key },
                update: { enabled: flag.enabled, description: flag.description },
                create: flag
            });
            console.log(`Upserted flag: ${result.key} (enabled: ${result.enabled})`);
        }
        console.log('Feature flags seeded successfully!');
    }
    catch (error) {
        console.error('Error seeding feature flags:', error);
    }
    finally {
        await prisma.$disconnect();
    }
}
// Run the seed function
seedFeatureFlags();
//# sourceMappingURL=seed-feature-flags.js.map