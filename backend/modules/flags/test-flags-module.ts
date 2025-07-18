/**
 * Simple test for the Feature Flags module
 */

import { flagsService } from './services/flags.service.ts';

async function testFlagsModule() {
  try {
    console.log('Testing Feature Flags module directly...');
    
    // Test 1: Create a test flag
    console.log('\nTest 1: Create a test flag');
    const testFlag = await flagsService.updateFlag('TEST_FLAG_TS', { enabled: true });
    console.log('Created flag:', testFlag);
    
    // Test 2: Get the flag
    console.log('\nTest 2: Get the flag');
    const isEnabled = await flagsService.getFlag('TEST_FLAG_TS');
    console.log('Is TEST_FLAG_TS enabled?', isEnabled);
    
    // Test 3: List all flags
    console.log('\nTest 3: List all flags');
    const allFlags = await flagsService.listFlags();
    console.log('All flags:', allFlags);
    
    // Test 4: Update the flag
    console.log('\nTest 4: Update the flag');
    const updatedFlag = await flagsService.updateFlag('TEST_FLAG_TS', { enabled: false });
    console.log('Updated flag:', updatedFlag);
    
    // Test 5: Get the updated flag
    console.log('\nTest 5: Get the updated flag');
    const isEnabledAfterUpdate = await flagsService.getFlag('TEST_FLAG_TS');
    console.log('Is TEST_FLAG_TS enabled after update?', isEnabledAfterUpdate);
    
    console.log('\nFeature Flags module tests completed successfully!');
  } catch (error) {
    console.error('Error testing Feature Flags module:', error);
  }
}

// Run the test
testFlagsModule();