import { parseInvestorApplication, parseInvestorUpdate, parseInvestorVerificationUpdate, parseWalletCreate, parseWalletVerificationUpdate, parseInvestorIdParam, parseWalletIdParam, parseInvestorListQuery } from '../utils/investor.validators.js';
export class InvestorController {
    investorService;
    constructor(investorService) {
        this.investorService = investorService;
    }
    /**
     * Apply as an investor
     * @route POST /investors/apply
     */
    applyAsInvestor = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
                return;
            }
            const parseResult = parseInvestorApplication(req.body);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            // Check if user can apply as an investor
            const canApply = await this.investorService.canUserApplyAsInvestor(userId);
            if (!canApply) {
                res.status(400).json({ success: false, error: 'BadRequest', message: 'User already has an investor profile' });
                return;
            }
            const investor = await this.investorService.applyAsInvestor(userId, parseResult.data);
            res.status(201).json({
                success: true,
                data: investor,
                message: 'Investor profile created successfully'
            });
        }
        catch (error) {
            console.error('Error updating wallet verification:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Delete a wallet
     * @route DELETE /investors/me/wallets/:walletId
     */
    deleteWallet = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
                return;
            }
            const parseResult = parseWalletIdParam(req.params);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            // Get investor ID from user ID
            const investor = await this.investorService.getInvestorByUserId(userId);
            if (!investor) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
                return;
            }
            // Get wallet to check ownership
            const wallet = await this.investorService.getWalletById(parseResult.data.walletId);
            if (!wallet) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Wallet not found' });
                return;
            }
            // Check if wallet belongs to the investor
            if (wallet.investorId !== investor.id) {
                res.status(403).json({ success: false, error: 'Forbidden', message: 'You do not have permission to delete this wallet' });
                return;
            }
            const success = await this.investorService.deleteWallet(parseResult.data.walletId);
            if (!success) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Wallet not found' });
                return;
            }
            res.status(200).json({
                success: true,
                message: 'Wallet deleted successfully'
            });
        }
        catch (error) {
            console.error('Error deleting wallet:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Update wallet verification status
     * @route PATCH /investors/wallets/:walletId/verification
     */
    updateWalletVerification = async (req, res) => {
        try {
            const parseIdResult = parseWalletIdParam(req.params);
            if (!parseIdResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseIdResult.error.message });
                return;
            }
            const parseBodyResult = parseWalletVerificationUpdate(req.body);
            if (!parseBodyResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseBodyResult.error.message });
                return;
            }
            const wallet = await this.investorService.updateWalletVerification(parseIdResult.data.walletId, parseBodyResult.data);
            res.status(200).json({
                success: true,
                data: wallet,
                message: parseBodyResult.data.isVerified
                    ? 'Wallet verification approved'
                    : 'Wallet verification revoked'
            });
        }
        catch (error) {
            console.error('Error adding wallet:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Update current user's investor profile
     * @route PATCH /investors/me
     */
    updateCurrentInvestorProfile = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
                return;
            }
            const parseResult = parseInvestorUpdate(req.body);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            // Get investor ID from user ID
            const investor = await this.investorService.getInvestorByUserId(userId);
            if (!investor) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
                return;
            }
            const updatedInvestor = await this.investorService.updateInvestor(investor.id, parseResult.data);
            res.status(200).json({
                success: true,
                data: updatedInvestor,
                message: 'Investor profile updated successfully'
            });
        }
        catch (error) {
            console.error('Error updating investor profile:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Get investor profile by ID
     * @route GET /investors/:id
     */
    getInvestorProfileById = async (req, res) => {
        try {
            const parseResult = parseInvestorIdParam(req.params);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            const investor = await this.investorService.getInvestorById(parseResult.data.id);
            if (!investor) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
                return;
            }
            res.status(200).json({ success: true, data: investor });
        }
        catch (error) {
            console.error('Error getting investor profile by ID:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Get all investors
     * @route GET /investors
     */
    getAllInvestors = async (req, res) => {
        try {
            const parseResult = parseInvestorListQuery(req.query);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            const { limit, offset, ...filters } = parseResult.data;
            const investors = await this.investorService.getAllInvestors({ limit, offset, ...filters });
            const total = await this.investorService.getInvestorCount(filters);
            res.status(200).json({
                success: true,
                data: investors,
                pagination: {
                    limit,
                    offset,
                    total,
                    hasMore: offset + investors.length < total
                }
            });
        }
        catch (error) {
            console.error('Error getting all investors:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Update investor verification status
     * @route PATCH /investors/:id/verification
     */
    updateInvestorVerification = async (req, res) => {
        try {
            const parseIdResult = parseInvestorIdParam(req.params);
            if (!parseIdResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseIdResult.error.message });
                return;
            }
            const parseBodyResult = parseInvestorVerificationUpdate(req.body);
            if (!parseBodyResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseBodyResult.error.message });
                return;
            }
            const investor = await this.investorService.updateInvestorVerification(parseIdResult.data.id, parseBodyResult.data);
            res.status(200).json({
                success: true,
                data: investor,
                message: parseBodyResult.data.isVerified
                    ? 'Investor verification approved'
                    : 'Investor verification revoked'
            });
        }
        catch (error) {
            console.error('Error updating investor verification:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Add a wallet to current investor
     * @route POST /investors/me/wallets
     */
    addWallet = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
                return;
            }
            const parseResult = parseWalletCreate(req.body);
            if (!parseResult.success) {
                res.status(400).json({ success: false, error: 'ValidationError', message: parseResult.error.message });
                return;
            }
            // Get investor ID from user ID
            const investor = await this.investorService.getInvestorByUserId(userId);
            if (!investor) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
                return;
            }
            const wallet = await this.investorService.addWallet(investor.id, parseResult.data);
            res.status(201).json({
                success: true,
                data: wallet,
                message: 'Wallet added successfully'
            });
        }
        catch (error) {
            console.error('Error applying as investor:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
    /**
     * Get current user's investor profile
     * @route GET /investors/me
     */
    getCurrentInvestorProfile = async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                res.status(401).json({ success: false, error: 'Unauthorized', message: 'User not authenticated' });
                return;
            }
            const investor = await this.investorService.getInvestorByUserId(userId);
            if (!investor) {
                res.status(404).json({ success: false, error: 'NotFound', message: 'Investor profile not found' });
                return;
            }
            res.status(200).json({ success: true, data: investor });
        }
        catch (error) {
            console.error('Error getting current investor profile:', error);
            res.status(500).json({
                success: false,
                error: 'ServerError',
                message: error instanceof Error ? error.message : 'An unknown error occurred'
            });
        }
    };
}
//# sourceMappingURL=investor.controller.js.map