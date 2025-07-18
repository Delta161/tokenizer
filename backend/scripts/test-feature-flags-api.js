/**
 * Test script for Feature Flags API endpoints
 */

// Using built-in fetch API (Node.js v18+)

// Using the fixed-server.js port
const API_BASE_URL = 'http://localhost:3001/api';

console.log('Using API base URL:', API_BASE_URL);

// For authenticated endpoints, you would need a valid JWT token
// const ADMIN_TOKEN = 'your-admin-jwt-token';

async function testFeatureFlagsAPI() {
  try {
    console.log('Testing Feature Flags API endpoints...');
    
    // Test 1: Get all flags (admin endpoint)
    console.log('\nTest 1: GET /admin/flags');
    console.log('Note: This requires admin authentication');
    try {
      // The API routes are mounted directly at /api/admin/flags
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/admin/flags`, {
        method: 'GET',
        headers: {
          // 'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        console.log('Status:', response.status);
        console.log('Response:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 2: Update a flag (admin endpoint)
    console.log('\nTest 2: PATCH /admin/flags/:key');
    console.log('Note: This requires admin authentication');
    try {
      // The API routes are mounted directly at /api/admin/flags/:key
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/admin/flags/TEST_API_FLAG`, {
        method: 'PATCH',
        headers: {
          // 'Authorization': `Bearer ${ADMIN_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled: true })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        console.log('Status:', response.status);
        console.log('Response:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    // Test 3: Get all flags (client endpoint)
    console.log('\nTest 3: GET /flags');
    try {
      // The API routes are mounted directly at /api/flags
      const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/flags`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Response:', data);
      } else {
        console.log('Status:', response.status);
        console.log('Response:', await response.text());
      }
    } catch (error) {
      console.error('Error:', error.message);
    }
    
    console.log('\nFeature Flags API tests completed!');
  } catch (error) {
    console.error('Error testing Feature Flags API:', error);
  }
}

// Run the test
testFeatureFlagsAPI();