/**
 * Azure AD OAuth Strategy
 * Configures Passport for Azure AD authentication
 */

import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import { mapAzureProfile, validateNormalizedProfile } from '../utils/oauthProfileMapper';
import { logger } from '@utils/logger';
import { prisma } from '../utils/prisma';

// Default redirect URL is configured in .env as AZURE_REDIRECT_URL

/**
 * Configure Azure AD strategy for Passport
 */
export const configureAzureStrategy = (): void => {
  const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
  const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
  const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID;
  const AZURE_REDIRECT_URL = process.env.AZURE_REDIRECT_URL;
  
  if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET || !AZURE_TENANT_ID) {
    logger.warn('Azure AD credentials not configured. Azure authentication will not work.');
    return;
  }
  
  const options = {
    identityMetadata: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`,
    clientID: AZURE_CLIENT_ID,
    responseType: 'code id_token',
    responseMode: 'form_post',
    redirectUrl: AZURE_REDIRECT_URL,
    allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
    clientSecret: AZURE_CLIENT_SECRET,
    validateIssuer: true,
    issuer: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`,
    passReqToCallback: true,
    scope: ['profile', 'email', 'openid'],
    loggingLevel: process.env.NODE_ENV === 'production' ? 'error' : 'info'
  };
  
  passport.use(
    new BearerStrategy(options, async (req, profile, done) => {
      try {
        // Map Azure profile to normalized format
        const normalizedProfile = mapAzureProfile(profile);
        
        // Log the raw and mapped profiles for debugging
        logger.debug('Raw Azure profile', { profile });
        logger.debug('Mapped profile', { normalizedProfile });
        
        // Try strict validation first (requires provider ID, provider, email, and at least one name field)
        const isStrictlyValid = validateNormalizedProfile(normalizedProfile, true);
        
        // If strict validation fails, try with relaxed validation (only requires provider ID and provider)
        // This allows authentication to proceed even with incomplete profile data
        if (!isStrictlyValid) {
          logger.warn('Azure profile failed strict validation, trying relaxed validation', { 
            normalizedProfile,
            missingFields: {
              providerId: !normalizedProfile.providerId,
              provider: !normalizedProfile.provider,
              email: !normalizedProfile.email,
              noNameInfo: !normalizedProfile.firstName && !normalizedProfile.lastName && !normalizedProfile.displayName
            }
          });
          
          // Check if profile passes relaxed validation (only provider ID and provider required)
          const isRelaxedValid = validateNormalizedProfile(normalizedProfile, false);
          
          if (!isRelaxedValid) {
            logger.error('Azure profile failed relaxed validation, authentication failed', { profile });
            return done(new Error('Invalid profile data: Missing critical fields (provider ID or provider)'));
          }
          
          // If we get here, the profile passed relaxed validation but failed strict validation
          // We'll continue but log a warning
          logger.warn('Proceeding with incomplete Azure profile', { normalizedProfile });
        }
        }
        
        // Find existing user by provider ID
        let user = await prisma.user.findFirst({
          where: {
            authProvider: 'AZURE',
            providerId: normalizedProfile.providerId
          }
        });
        
        // If user not found by provider ID and we have an email, try to find by email
        if (!user && normalizedProfile.email) {
          user = await prisma.user.findUnique({
            where: { email: normalizedProfile.email }
          });
          
          // If user exists with this email but different provider, update provider info
          if (user) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: {
                authProvider: 'AZURE',
                providerId: normalizedProfile.providerId
              }
            });
            
            logger.info('Updated existing user with Azure provider', {
              userId: user.id,
              email: user.email
            });
          }
        }
        
        // If user still not found, create new user
        if (!user) {
          // Generate a placeholder email if missing
          const email = normalizedProfile.email || 
            `${normalizedProfile.providerId}@placeholder.azure.auth`;
            
          user = await prisma.user.create({
            data: {
              email,
              firstName: normalizedProfile.firstName,
              lastName: normalizedProfile.lastName,
              authProvider: 'AZURE',
              providerId: normalizedProfile.providerId,
              avatarUrl: normalizedProfile.avatarUrl,
              role: normalizedProfile.role || 'INVESTOR'
            }
          });
          
          logger.info('Created new user from Azure OAuth', {
            userId: user.id,
            email: user.email
          });
        }
        
        // Update last login timestamp
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() }
        });
        
        // Return user
        return done(null, user, { scope: 'all' });
      } catch (error) {
        logger.error('Azure authentication error', { error });
        return done(error);
      }
    })
  );
  
  logger.info('Azure AD strategy configured');
};

