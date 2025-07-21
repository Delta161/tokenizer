import fetch from 'node-fetch';

/**
 * Simple script to test the Visit API endpoints
 * Run with: node scripts/test-visit-api.js
 */

const API_BASE_URL = 'http://localhost:3001';

// Mock user credentials - in a real app, you would use proper authentication
const INVESTOR_TOKEN = 'mock-investor-token';
const ADMIN_TOKEN = 'mock-admin-token';

async function testVisitAPI() {
  console.log('Testing Visit API endpoints...');
  
  try {
    // Test 1: Create a new visit (anonymous)
    console.log('\n1. Creating a new anonymous visit:');
    const createVisitResponse = await fetch(`${API_BASE_URL}/api/visits`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        propertyId: '00000000-0000-0000-0000-000000000001' // Replace with a valid property ID
      })
    });
    
    if (!createVisitResponse.ok) {
      throw new Error(`Failed to create visit: ${createVisitResponse.status} ${createVisitResponse.statusText}`);
    }
    
    const createVisitResult = await createVisitResponse.json();
    console.log('Visit created:', JSON.stringify(createVisitResult, null, 2));
    
    // Test 2: Get property visit summary
    console.log('\n2. Fetching property visit summary:');
    const propertyId = '00000000-0000-0000-0000-000000000001'; // Replace with a valid property ID
    const propertyVisitsResponse = await fetch(`${API_BASE_URL}/api/analytics/properties/${propertyId}/visits`, {
      headers: {
        'Authorization': `Bearer ${INVESTOR_TOKEN}`
      }
    });
    
    if (!propertyVisitsResponse.ok) {
      throw new Error(`Failed to fetch property visits: ${propertyVisitsResponse.status} ${propertyVisitsResponse.statusText}`);
    }
    
    const propertyVisits = await propertyVisitsResponse.json();
    console.log(`Retrieved property visit summary:`, JSON.stringify(propertyVisits, null, 2));
    
    // Test 3: Get client visit breakdown
    console.log('\n3. Fetching client visit breakdown:');
    const clientId = '00000000-0000-0000-0000-000000000001'; // Replace with a valid client ID
    const clientVisitsResponse = await fetch(`${API_BASE_URL}/api/analytics/clients/${clientId}/visits`, {
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });
    
    if (!clientVisitsResponse.ok) {
      throw new Error(`Failed to fetch client visits: ${clientVisitsResponse.status} ${clientVisitsResponse.statusText}`);
    }
    
    const clientVisits = await clientVisitsResponse.json();
    console.log(`Retrieved client visit breakdown:`, JSON.stringify(clientVisits, null, 2));
    
    // Test 4: Get trending properties
    console.log('\n4. Fetching trending properties:');
    const trendingResponse = await fetch(`${API_BASE_URL}/api/analytics/trending`, {
      headers: {
        'Authorization': `Bearer ${INVESTOR_TOKEN}`
      }
    });
    
    if (!trendingResponse.ok) {
      throw new Error(`Failed to fetch trending properties: ${trendingResponse.status} ${trendingResponse.statusText}`);
    }
    
    const trendingProperties = await trendingResponse.json();
    console.log(`Retrieved trending properties:`, JSON.stringify(trendingProperties, null, 2));
    
    console.log('\nVisit API tests completed successfully!');
  } catch (error) {
    console.error('Error testing Visit API:', error);
  }
}

// Run the test
testVisitAPI();