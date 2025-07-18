/**
 * Test script for Feature Flags module
 *
 * This script demonstrates how to use the Feature Flags module
 * to create, update, and read feature flags.
 */
import { flagsService } from '../modules/flags/services/flags.service.js';
// Note: In a TypeScript project, you would typically need to compile TS to JS first
// This script assumes the TypeScript files have been compiled to JavaScript
async function testFeatureFlags() {
    try {
        console.log('Testing Feature Flags module...');
        // Create or update some feature flags
        console.log('\nCreating/updating feature flags:');
        const newFeature = await flagsService.updateFlag('NEW_FEATURE', { enabled: true });
        console.log('NEW_FEATURE:', newFeature);
        const betaFeature = await flagsService.updateFlag('BETA_FEATURE', { enabled: false });
        console.log('BETA_FEATURE:', betaFeature);
        // List all flags
        console.log('\nListing all feature flags:');
        const allFlags = await flagsService.listFlags();
        console.log(allFlags);
        // Test feature flag usage
        console.log('\nTesting feature flag usage:');
        const isNewFeatureEnabled = await flagsService.getFlag('NEW_FEATURE');
        console.log('Is NEW_FEATURE enabled?', isNewFeatureEnabled);
        const isBetaFeatureEnabled = await flagsService.getFlag('BETA_FEATURE');
        console.log('Is BETA_FEATURE enabled?', isBetaFeatureEnabled);
        // Test non-existent flag (should default to false)
        const isUnknownFeatureEnabled = await flagsService.getFlag('UNKNOWN_FEATURE');
        console.log('Is UNKNOWN_FEATURE enabled?', isUnknownFeatureEnabled);
        console.log('\nFeature Flags module test completed successfully!');
    }
    catch (error) {
        console.error('Error testing Feature Flags module:', error);
    }
}
// Run the test
testFeatureFlags();
//# sourceMappingURL=test-feature-flags.js.map