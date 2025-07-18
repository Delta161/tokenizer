import fetch from 'node-fetch';
/**
 * Simple script to test the Audit API endpoints
 * Run with: node scripts/test-audit-api.js
 */
const API_BASE_URL = 'http://localhost:3001';
// Mock admin user credentials - in a real app, you would use proper authentication
const ADMIN_TOKEN = 'mock-admin-token';
async function testAuditAPI() {
    console.log('Testing Audit API endpoints...');
    try {
        // Test 1: Get all audit logs
        console.log('\n1. Fetching all audit logs:');
        const allLogsResponse = await fetch(`${API_BASE_URL}/api/audit/logs`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        });
        if (!allLogsResponse.ok) {
            throw new Error(`Failed to fetch audit logs: ${allLogsResponse.status} ${allLogsResponse.statusText}`);
        }
        const allLogs = await allLogsResponse.json();
        console.log(`Retrieved ${allLogs.length} audit logs`);
        console.log('First log:', JSON.stringify(allLogs[0], null, 2));
        // Test 2: Get a specific audit log by ID
        if (allLogs.length > 0) {
            const logId = allLogs[0].id;
            console.log(`\n2. Fetching specific audit log with ID: ${logId}`);
            const specificLogResponse = await fetch(`${API_BASE_URL}/api/audit/logs/${logId}`, {
                headers: {
                    'Authorization': `Bearer ${ADMIN_TOKEN}`
                }
            });
            if (!specificLogResponse.ok) {
                throw new Error(`Failed to fetch specific audit log: ${specificLogResponse.status} ${specificLogResponse.statusText}`);
            }
            const specificLog = await specificLogResponse.json();
            console.log('Retrieved specific log:', JSON.stringify(specificLog, null, 2));
        }
        // Test 3: Filter audit logs by action type
        console.log('\n3. Filtering audit logs by action type (PROPERTY_UPDATED):');
        const filteredLogsResponse = await fetch(`${API_BASE_URL}/api/audit/logs?actionType=PROPERTY_UPDATED`, {
            headers: {
                'Authorization': `Bearer ${ADMIN_TOKEN}`
            }
        });
        if (!filteredLogsResponse.ok) {
            throw new Error(`Failed to fetch filtered audit logs: ${filteredLogsResponse.status} ${filteredLogsResponse.statusText}`);
        }
        const filteredLogs = await filteredLogsResponse.json();
        console.log(`Retrieved ${filteredLogs.length} filtered logs`);
        if (filteredLogs.length > 0) {
            console.log('First filtered log:', JSON.stringify(filteredLogs[0], null, 2));
        }
        console.log('\nAudit API tests completed successfully!');
    }
    catch (error) {
        console.error('Error testing Audit API:', error);
    }
}
testAuditAPI();
//# sourceMappingURL=test-audit-api.js.map