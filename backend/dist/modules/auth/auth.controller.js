import 'express-session';
import { generateAccessToken, generateRefreshToken, setTokenCookies, clearTokenCookies } from './jwt.js';
import logger, { logUserLogout } from './logger.js';
/**
 * Handle successful OAuth authentication
 * This is called after successful OAuth callback
 */
export const handleAuthSuccess = async (req, res, user) => {
    try {
        // Generate JWT tokens
        const accessToken = generateAccessToken({
            id: user.id,
            email: user.email,
            role: user.role,
            provider: user.authProvider
        });
        const refreshToken = generateRefreshToken(user.id);
        // Set HTTP-only cookies
        setTokenCookies(res, accessToken, refreshToken);
        // Prepare response data
        const authResponse = {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                role: user.role,
                authProvider: user.authProvider,
                avatarUrl: user.avatarUrl || undefined
            },
            tokens: {
                accessToken,
                refreshToken
            },
            message: 'Authentication successful'
        };
        // Check if this is an API request or browser request
        const acceptsJson = req.accepts(['html', 'json']) === 'json';
        const frontendUrl = process.env.FRONTEND_URL;
        if (acceptsJson || !frontendUrl) {
            // API request or no frontend URL configured - return JSON
            res.status(200).json(authResponse);
        }
        else {
            // Browser request - redirect to frontend with success
            const redirectUrl = new URL('/dashboard', frontendUrl);
            redirectUrl.searchParams.set('auth', 'success');
            res.redirect(redirectUrl.toString());
        }
    }
    catch (error) {
        logger.error('Authentication success handler failed', {
            userId: user.id,
            email: user.email,
            provider: user.authProvider
        }, error);
        handleAuthError(req, res, 'Authentication processing failed');
    }
};
/**
 * Handle OAuth authentication errors
 */
export const handleAuthError = (req, res, errorMessage = 'Authentication failed') => {
    logger.error('Authentication error occurred', {
        errorMessage,
        userAgent: req.get('User-Agent'),
        ipAddress: req.ip
    });
    const acceptsJson = req.accepts(['html', 'json']) === 'json';
    const frontendUrl = process.env.FRONTEND_URL;
    if (acceptsJson || !frontendUrl) {
        // API request or no frontend URL - return JSON error
        res.status(401).json({
            success: false,
            error: 'Authentication failed',
            message: errorMessage
        });
    }
    else {
        // Browser request - redirect to frontend with error
        const redirectUrl = new URL('/login', frontendUrl);
        redirectUrl.searchParams.set('error', 'auth_failed');
        redirectUrl.searchParams.set('message', errorMessage);
        res.redirect(redirectUrl.toString());
    }
};
/**
 * Google OAuth callback handler
 */
export const googleCallback = (req, res, next) => {
    // This will be called after passport.authenticate('google')
    if (req.user) {
        handleAuthSuccess(req, res, req.user);
    }
    else {
        handleAuthError(req, res, 'Google authentication failed');
    }
};
/**
 * Azure AD OAuth callback handler
 */
export const azureCallback = (req, res, next) => {
    // This will be called after passport.authenticate('azure-ad')
    if (req.user) {
        handleAuthSuccess(req, res, req.user);
    }
    else {
        handleAuthError(req, res, 'Azure AD authentication failed');
    }
};
/**
 * Logout handler
 */
export const logout = (req, res) => {
    try {
        // Clear authentication cookies
        clearTokenCookies(res);
        // Log logout event
        if (req.user) {
            logUserLogout(req.user.id, req.user.email);
        }
        // Destroy session if using sessions
        if (req.session) {
            req.session.destroy((err) => {
                if (err) {
                    logger.error('Session destruction failed', {}, err);
                }
            });
        }
        // Clear user from request
        req.user = undefined;
        const acceptsJson = req.accepts(['html', 'json']) === 'json';
        const frontendUrl = process.env.FRONTEND_URL;
        if (acceptsJson || !frontendUrl) {
            // API request - return JSON
            res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        else {
            // Browser request - redirect to frontend
            const redirectUrl = new URL('/login', frontendUrl);
            redirectUrl.searchParams.set('message', 'logged_out');
            res.redirect(redirectUrl.toString());
        }
    }
    catch (error) {
        logger.error('Logout process failed', {
            userId: req.user?.id
        }, error);
        res.status(500).json({
            success: false,
            error: 'Logout failed',
            message: 'An error occurred during logout'
        });
    }
};
/**
 * Get current user information
 */
export const getCurrentUser = (req, res) => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Not authenticated',
                message: 'No authenticated user found'
            });
            return;
        }
        res.status(200).json({
            success: true,
            user: {
                id: req.user.id,
                email: req.user.email,
                fullName: req.user.fullName,
                role: req.user.role,
                authProvider: req.user.authProvider
            },
            message: 'User information retrieved successfully'
        });
    }
    catch (error) {
        logger.error('Get current user failed', {
            userId: req.user?.id
        }, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to retrieve user information'
        });
    }
};
/**
 * Refresh token handler
 */
export const refreshToken = (req, res) => {
    try {
        // This would implement refresh token logic
        // For now, we'll return a not implemented response
        res.status(501).json({
            success: false,
            error: 'Not implemented',
            message: 'Token refresh functionality will be implemented in a future version'
        });
    }
    catch (error) {
        logger.error('Refresh token failed', {}, error);
        res.status(500).json({
            success: false,
            error: 'Server error',
            message: 'Failed to refresh token'
        });
    }
};
/**
 * Health check for authentication service
 */
export const authHealthCheck = (req, res) => {
    res.status(200).json({
        success: true,
        service: 'Authentication Service',
        status: 'healthy',
        timestamp: new Date().toISOString(),
        providers: {
            google: !!process.env.GOOGLE_CLIENT_ID,
            azure: !!process.env.AZURE_CLIENT_ID
        }
    });
};
//# sourceMappingURL=auth.controller.js.map