import * as passport from 'passport';
import { OIDCStrategy } from 'passport-azure-ad';
import { mapAzureProfile, validateNormalizedProfile } from '../oauthProfileMapper.js';
import { findOrCreateUser, updateUserLoginMetadata } from '../auth.service.js';
/**
 * Azure AD OAuth strategy configuration
 */
export const configureAzureStrategy = () => {
    const clientID = process.env.AZURE_CLIENT_ID;
    const clientSecret = process.env.AZURE_CLIENT_SECRET;
    const tenantID = process.env.AZURE_TENANT_ID || 'common'; // 'common' allows multi-tenant
    const redirectUrl = process.env.AZURE_REDIRECT_URL || '/auth/azure/callback';
    if (!clientID || !clientSecret) {
        console.warn('Azure AD OAuth credentials not configured. Azure authentication will be disabled.');
        return;
    }
    passport.use('azure-ad', new OIDCStrategy({
        identityMetadata: `https://login.microsoftonline.com/${tenantID}/v2.0/.well-known/openid_configuration`,
        clientID,
        clientSecret,
        responseType: 'code',
        responseMode: 'form_post', // Azure AD typically uses form_post
        redirectUrl,
        allowHttpForRedirectUrl: process.env.NODE_ENV === 'development', // Allow HTTP in development
        scope: ['profile', 'email', 'openid'],
        passReqToCallback: true // Enable access to request object
    }, async (req, iss, sub, profile, accessToken, refreshToken, done) => {
        try {
            console.log('Azure AD OAuth callback received for user:', profile.oid);
            // Map Azure profile to normalized format
            const normalizedProfile = mapAzureProfile(profile);
            // Validate the normalized profile
            validateNormalizedProfile(normalizedProfile);
            // Find or create user in database
            const user = await findOrCreateUser(normalizedProfile);
            // Update login metadata
            await updateUserLoginMetadata(user.id, {
                ipAddress: req.ip || req.connection?.remoteAddress,
                userAgent: req.get('User-Agent'),
                provider: 'AZURE'
            });
            console.log('Azure AD OAuth authentication successful for:', user.email);
            // Return user object to be stored in session or used for JWT
            return done(null, user);
        }
        catch (error) {
            console.error('Azure AD OAuth authentication error:', error);
            // Return error with user-friendly message
            if (error instanceof Error) {
                return done(new Error(`Azure AD authentication failed: ${error.message}`));
            }
            return done(new Error('Azure AD authentication failed due to an unexpected error'));
        }
    }));
    console.log('Azure AD OAuth strategy configured successfully');
};
/**
 * Azure AD OAuth route options
 */
export const azureAuthOptions = {
    prompt: 'select_account', // Force account selection
    domain_hint: undefined // Can be set to specific domain if needed
};
/**
 * Azure AD OAuth callback options
 */
export const azureCallbackOptions = {
    failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=azure_auth_failed` : '/login?error=azure_auth_failed',
    successRedirect: false // We'll handle success manually to set JWT
};
//# sourceMappingURL=azure.strategy.js.map