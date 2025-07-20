import fetch from 'node-fetch';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// Mock webhook secret (same as in kycProvider.utils.ts)
const WEBHOOK_SECRET = 'mock_sumsub_webhook_secret';
// Function to generate a mock webhook payload
function generateMockPayload(referenceId) {
    // Generate a random status (approved, rejected, or pending)
    const statuses = ['approved', 'rejected', 'pending'];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    return {
        type: 'applicantReviewed',
        referenceId,
        status,
        reviewAnswer: status === 'approved' ? 'GREEN' : status === 'rejected' ? 'RED' : 'PENDING',
        rejectReason: status === 'rejected' ? 'Document authenticity could not be verified' : undefined,
        createdAt: new Date().toISOString(),
        metadata: {
            reviewStatus: status,
            applicantId: `mock-applicant-${referenceId}`,
            createdAt: new Date().toISOString(),
            reviewDate: new Date().toISOString(),
            reviewResult: {
                reviewAnswer: status === 'approved' ? 'GREEN' : status === 'rejected' ? 'RED' : 'PENDING',
                label: status.toUpperCase(),
                rejectLabels: status === 'rejected' ? ['DOCUMENT_VALIDITY'] : [],
                rejectReasons: status === 'rejected' ? ['Document authenticity could not be verified'] : []
            }
        }
    };
}
// Function to sign the payload
function signPayload(payload) {
    const payloadString = JSON.stringify(payload);
    const hmac = crypto.createHmac('sha1', WEBHOOK_SECRET);
    return hmac.update(payloadString).digest('hex');
}
async function main() {
    try {
        // Get reference ID from command line arguments or use a default
        const referenceId = process.argv[2] || `sumsub_test_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        console.log(`Testing webhook with reference ID: ${referenceId}`);
        // Generate payload
        const payload = generateMockPayload(referenceId);
        const payloadString = JSON.stringify(payload);
        // Sign payload
        const signature = signPayload(payload);
        // Send webhook request
        const response = await fetch('http://localhost:3000/api/kyc/webhook/sumsub', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-payload-digest': signature
            },
            body: payloadString
        });
        const responseData = await response.json();
        console.log('Response status:', response.status);
        console.log('Response body:', responseData);
        if (response.ok) {
            console.log('Webhook test successful!');
        }
        else {
            console.error('Webhook test failed!');
        }
    }
    catch (error) {
        console.error('Error testing webhook:', error);
    }
}
main();
//# sourceMappingURL=test-kyc-webhook.js.map