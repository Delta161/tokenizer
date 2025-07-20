"use strict";
/**
 * Simple test script to verify the server is working
 */
async function testServer() {
    try {
        console.log('Testing server...');
        // Test root endpoint
        console.log('\nTest: GET /');
        const response = await fetch('http://localhost:3001/');
        if (response.ok) {
            const data = await response.json();
            console.log('Status:', response.status);
            console.log('Response:', data);
        }
        else {
            console.log('Status:', response.status);
            console.log('Response:', await response.text());
        }
        // Test documents endpoint
        console.log('\nTest: GET /api/documents');
        const docsResponse = await fetch('http://localhost:3001/api/documents');
        if (docsResponse.ok) {
            const data = await docsResponse.json();
            console.log('Status:', docsResponse.status);
            console.log('Response:', data);
        }
        else {
            console.log('Status:', docsResponse.status);
            console.log('Response:', await docsResponse.text());
        }
        console.log('\nServer tests completed!');
    }
    catch (error) {
        console.error('Error testing server:', error);
    }
}
// Run the test
testServer();
//# sourceMappingURL=test-server.js.map