declare function apiRequest(endpoint: any, method?: string, body?: null): Promise<{
    status: number;
    data: any;
}>;
declare function testFeatureFlagsAPI(): Promise<void>;
/**
 * Test script for Feature Flags API
 *
 * This script tests the Feature Flags API endpoints
 * Note: You need to have a valid admin JWT token to run this script
 */
declare const API_BASE_URL: "http://localhost:3001/api";
declare let adminToken: null;
//# sourceMappingURL=test-feature-flags-api.d.ts.map