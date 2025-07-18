"use strict";
/**
 * Test script for Feature Flags API
 *
 * This script tests the Feature Flags API endpoints
 * Note: You need to have a valid admin JWT token to run this script
 */
// Using built-in fetch API in Node.js v18+
// Configuration
const API_BASE_URL = 'http://localhost:3001/api';
let adminToken = null; // You'll need to set this with a valid admin token
// Helper function to make authenticated API requests
async function apiRequest(endpoint, method = 'GET', body = null) {
    const headers = {
        'Content-Type': 'application/json',
        ...(adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {})
    };
    const options = {
        method,
        headers,
        ...(body ? { body: JSON.stringify(body) } : {})
    };
    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
    const data = await response.json();
    return { status: response.status, data };
}
async function testFeatureFlagsAPI() {
    try {
        console.log('Testing Feature Flags API...');
        console.log('----------------------------');
        // Test 1: Get all flags (admin endpoint)
        console.log('\nTest 1: Get all flags (admin endpoint)');
        const getAllResult = await apiRequest('/admin/flags');
        console.log(`Status: ${getAllResult.status}`);
        console.log('Response:', JSON.stringify(getAllResult.data, null, 2));
        // Test 2: Update a flag (admin endpoint)
        console.log('\nTest 2: Update a flag (admin endpoint)');
        const updateResult = await apiRequest('/admin/flags/NEW_EXAMPLE_FEATURE', 'PATCH', { enabled: true });
        console.log(`Status: ${updateResult.status}`);
        console.log('Response:', JSON.stringify(updateResult.data, null, 2));
        // Test 3: Get all flags again to verify the update
        console.log('\nTest 3: Get all flags again to verify the update');
        const getAllAfterUpdateResult = await apiRequest('/admin/flags');
        console.log(`Status: ${getAllAfterUpdateResult.status}`);
        console.log('Response:', JSON.stringify(getAllAfterUpdateResult.data, null, 2));
        // Test 4: Get client-facing flags endpoint
        console.log('\nTest 4: Get client-facing flags endpoint');
        const getClientFlagsResult = await apiRequest('/flags');
        console.log(`Status: ${getClientFlagsResult.status}`);
        console.log('Response:', JSON.stringify(getClientFlagsResult.data, null, 2));
        console.log('\nFeature Flags API tests completed!');
    }
    catch (error) {
        console.error('Error testing Feature Flags API:', error);
    }
}
// Check if admin token is provided
if (!adminToken) {
    console.log('\n⚠️ WARNING: No admin token provided. Authentication will fail.');
    console.log('To use this script:');
    console.log('1. Login as an admin user');
    console.log('2. Get your JWT token');
    console.log('3. Set the adminToken variable in this script');
    console.log('\nRunning tests anyway to show expected failures...');
}
// Run the tests
testFeatureFlagsAPI();
//# sourceMappingURL=test-feature-flags-api.js.map