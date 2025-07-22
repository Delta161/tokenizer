/**
 * Azure AD OAuth Strategy
 * Configures Passport for Azure AD authentication
 */

import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import { mapAzureProfile, validateNormalizedProfile } from '../utils/oauthProfileMapper';
import { formatFullName } from '../utils/user.utils';
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
        
        // Enhanced logging for debugging
        logger.debug('Raw Azure profile', { profile });
        logger.debug('Mapped profile', { normalizedProfile });
        
        // Log specific fields for better troubleshooting
        logger.debug('Azure profile key fields', {
          providerId: normalizedProfile.providerId,
          email: normalizedProfile.email,
          firstName: normalizedProfile.firstName,
          lastName: normalizedProfile.lastName,
          displayName: normalizedProfile.displayName
        });
        
        // Start with relaxed validation first (only requires provider ID and provider)
        // This allows authentication to proceed even with incomplete profile data
        const isRelaxedValid = validateNormalizedProfile(normalizedProfile, false);
        
        if (!isRelaxedValid) {
          logger.error('Azure profile failed relaxed validation, authentication failed', { 
            profile,
            missingFields: {
              providerId: !normalizedProfile.providerId,
              provider: !normalizedProfile.provider
            }
          });
          return done(new Error('Invalid profile data: Missing critical fields (provider ID or provider)'));
        }
        
        // If we get here, the profile passed relaxed validation
        // Now check if it would pass strict validation (requires email and name fields)
        const isStrictlyValid = validateNormalizedProfile(normalizedProfile, true);
        
        if (!isStrictlyValid) {
          // Profile passed relaxed but failed strict validation
          // We'll continue but log detailed warnings about missing fields
          logger.warn('Proceeding with incomplete Azure profile', { 
            normalizedProfile,
            missingFields: {
              email: !normalizedProfile.email,
              noNameInfo: !normalizedProfile.firstName && !normalizedProfile.lastName && !normalizedProfile.displayName
            }
          });
        } else {
          logger.info('Azure profile passed strict validation', { 
            providerId: normalizedProfile.providerId,
            hasEmail: !!normalizedProfile.email,
            hasName: !!(normalizedProfile.firstName || normalizedProfile.lastName || normalizedProfile.displayName)
          });
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
            
          try {
            // Use formatFullName utility for consistent name formatting
            const fullName = formatFullName(normalizedProfile.firstName, normalizedProfile.lastName);
            
            // Log user creation attempt
            logger.info('Creating new user from Azure profile', {
              email,
              providerId: normalizedProfile.providerId,
              hasName: !!fullName
            });
            
            // If fullName is empty after formatting, use displayName or a placeholder
            const finalFullName = fullName || normalizedProfile.displayName || 'Azure User';
            
            user = await prisma.user.create({
              data: {
                email,
                fullName: finalFullName,
                authProvider: 'AZURE',
                providerId: normalizedProfile.providerId,
                avatarUrl: normalizedProfile.avatarUrl,
                role: normalizedProfile.role || 'INVESTOR'
              }
            });
            
            logger.info('Successfully created new user from Azure profile', { userId: user.id });
          } catch (createError) {
            logger.error('Failed to create user from Azure profile', { 
              error: createError.message,
              profile: normalizedProfile 
            });
            return done(new Error(`Failed to create user: ${createError.message}`));
          }
          
          // Previous log statement removed to avoid duplication
          logger.debug('User details', {
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
        // Enhanced error logging with more context
        logger.error('Azure authentication error', { 
          errorMessage: error.message,
          errorStack: error.stack,
          profileInfo: profile ? {
            oid: profile.oid,
            hasEmail: !!profile.mail || !!profile.userPrincipalName,
            hasName: !!profile.givenName || !!profile.surname || !!profile.displayName
          } : 'No profile data'
        });
        
        // Return a more user-friendly error message
        return done(new Error(`Authentication failed: ${error.message}`));
      }
    })
  );
  
  logger.info('Azure AD strategy configured');
};

