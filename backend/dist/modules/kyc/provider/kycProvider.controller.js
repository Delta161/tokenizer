import { KycProvider } from './kycProvider.types.js';
import { logger } from '../../../utils/logger.js';
export class KycProviderController {
    kycProviderService;
    constructor(kycProviderService) {
        this.kycProviderService = kycProviderService;
    }
    /**
     * Initiate KYC verification with a provider
     */
    initiateVerification = async (req, res) => {
        try {
            const { provider } = req.params;
            const { redirectUrl } = req.body;
            // Validate provider
            if (!Object.values(KycProvider).includes(provider)) {
                res.status(400).json({ error: `Unsupported provider: ${provider}` });
                return;
            }
            // Validate redirect URL
            if (!redirectUrl || typeof redirectUrl !== 'string') {
                res.status(400).json({ error: 'Invalid redirect URL' });
                return;
            }
            // Get user ID from authenticated user
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            // Initialize verification
            const session = await this.kycProviderService.initVerification(userId, provider, redirectUrl);
            res.status(200).json({
                redirectUrl: session.redirectUrl,
                expiresAt: session.expiresAt,
                referenceId: session.referenceId
            });
        }
        catch (error) {
            logger.error(`Error initiating verification: ${error instanceof Error ? error.message : String(error)}`);
            res.status(500).json({ error: 'Failed to initiate verification' });
        }
    };
    /**
     * Handle webhook from KYC provider
     */
    handleWebhook = async (req, res) => {
        try {
            const { provider } = req.params;
            const rawBody = req.body;
            // Log webhook request
            logger.info(`Received webhook from ${provider}`, {
                provider,
                headers: req.headers,
                body: typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody)
            });
            // Validate provider
            if (!Object.values(KycProvider).includes(provider)) {
                logger.warn(`Webhook received from unsupported provider: ${provider}`);
                res.status(400).json({ error: `Unsupported provider: ${provider}` });
                return;
            }
            // Verify webhook signature
            const bodyString = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
            const verificationResult = this.kycProviderService.verifyWebhookSignature(provider, req.headers, bodyString);
            if (!verificationResult.isValid) {
                logger.warn(`Invalid webhook signature from ${provider}: ${verificationResult.error}`);
                res.status(401).json({ error: 'Invalid signature' });
                return;
            }
            // Process webhook
            if (!verificationResult.payload) {
                logger.warn(`No payload in webhook from ${provider}`);
                res.status(400).json({ error: 'Invalid payload' });
                return;
            }
            const updatedRecord = await this.kycProviderService.processWebhook(provider, verificationResult.payload);
            if (!updatedRecord) {
                logger.warn(`No KYC record found for reference ID: ${verificationResult.payload.referenceId}`);
                res.status(404).json({ error: 'KYC record not found' });
                return;
            }
            // Return success response
            res.status(200).json({ success: true });
        }
        catch (error) {
            logger.error(`Error handling webhook: ${error instanceof Error ? error.message : String(error)}`);
            res.status(500).json({ error: 'Failed to process webhook' });
        }
    };
    /**
     * Get KYC verification status (admin only)
     */
    getVerificationStatus = async (req, res) => {
        try {
            const { userId } = req.params;
            // Sync KYC status from provider
            const updatedRecord = await this.kycProviderService.syncKycStatus(userId);
            if (!updatedRecord) {
                res.status(404).json({ error: 'KYC record not found' });
                return;
            }
            res.status(200).json({
                userId: updatedRecord.userId,
                status: updatedRecord.status,
                provider: updatedRecord.provider,
                referenceId: updatedRecord.referenceId,
                verifiedAt: updatedRecord.verifiedAt,
                rejectedAt: updatedRecord.rejectedAt,
                rejectionReason: updatedRecord.rejectionReason,
                updatedAt: updatedRecord.updatedAt
            });
        }
        catch (error) {
            logger.error(`Error getting verification status: ${error instanceof Error ? error.message : String(error)}`);
            res.status(500).json({ error: 'Failed to get verification status' });
        }
    };
}
//# sourceMappingURL=kycProvider.controller.js.map