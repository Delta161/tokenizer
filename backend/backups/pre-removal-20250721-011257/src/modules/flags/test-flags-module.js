/**
 * Simple test for Feature Flags module
 */

const { flagsService } = require('./flags.service');

// Define a test flag key
const TEST_FLAG_JS = 'TEST_FLAG_JS';

/**
 * Run a simple test of the feature flags module
 */
async function testFeatureFlagsModule() {
  console.log('Testing Feature Flags module...');

  try {
    // Create or update a test flag
    await flagsService.updateFlag(TEST_FLAG_JS, {
      enabled: true,
      description: 'Test flag created from JavaScript test'
    });
    console.log(`Created/updated flag: ${TEST_FLAG_JS}`);

    // Get the flag
    const flag = await flagsService.getFlag(TEST_FLAG_JS);
    console.log(`Retrieved flag ${TEST_FLAG_JS}: ${flag ? 'enabled' : 'disabled'}`);

    // List all flags
    const allFlags = await flagsService.listFlags();
    console.log(`Listed ${allFlags.length} flags:`);
    allFlags.forEach(f => {
      console.log(`- ${f.key}: ${f.enabled ? 'enabled' : 'disabled'} (${f.description || 'no description'})`);
    });

    // Update the flag
    await flagsService.updateFlag(TEST_FLAG_JS, {
      enabled: false
    });
    console.log(`Updated flag ${TEST_FLAG_JS} to disabled`);

    // Verify update
    const updatedFlag = await flagsService.getFlag(TEST_FLAG_JS);
    console.log(`Verified flag ${TEST_FLAG_JS} is now: ${updatedFlag ? 'enabled' : 'disabled'}`);

    console.log('Feature Flags module test completed successfully');
  } catch (error) {
    console.error('Feature Flags module test failed:', error);
  }
}

// Run the test if this file is executed directly
if (require.main === module) {
  testFeatureFlagsModule();
}