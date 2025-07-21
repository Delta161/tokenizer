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
        
        // Validate profile
        if (!validateNormalizedProfile(normalizedProfile)) {
          logger.error('Invalid Azure profile', { profile });
          return done(new Error('Invalid profile data'));
        }
        
        // Find existing user by provider ID
        let user = await prisma.user.findFirst({
          where: {
            authProvider: 'AZURE',
            providerId: normalizedProfile.providerId
          }
        });
        
        // If user not found by provider ID, try to find by email
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
          user = await prisma.user.create({
            data: {
              email: normalizedProfile.email,
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

