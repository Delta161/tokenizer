/**
 * Azure AD OAuth Strategy
 * Configures Passport for Azure AD authentication
 */

import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import { PrismaClient } from '@prisma/client';
import { mapAzureProfile, validateNormalizedProfile } from '../oauthProfileMapper';
import { logger } from '../../../utils/logger';

const prisma = new PrismaClient();

// Default redirect URL
const DEFAULT_REDIRECT_URL = 'http://localhost:3000/api/v1/auth/azure/callback';

/**
 * Azure authentication options
 */
export const azureAuthOptions = {
  prompt: 'select_account'
};

/**
 * Azure callback options
 */
export const azureCallbackOptions = {
  failureRedirect: '/api/v1/auth/error?error=azure_auth_failed'
};

/**
 * Configure Azure AD OAuth strategy for Passport
 */
export const configureAzureStrategy = (): void => {
  const AZURE_CLIENT_ID = process.env.AZURE_CLIENT_ID;
  const AZURE_CLIENT_SECRET = process.env.AZURE_CLIENT_SECRET;
  const AZURE_TENANT_ID = process.env.AZURE_TENANT_ID || 'common';
  const AZURE_REDIRECT_URL = process.env.AZURE_REDIRECT_URL || DEFAULT_REDIRECT_URL;
  
  if (!AZURE_CLIENT_ID || !AZURE_CLIENT_SECRET) {
    logger.warn('Azure AD OAuth credentials not configured. Azure authentication will not work.');
    return;
  }
  
  const identityMetadata = `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0/.well-known/openid-configuration`;
  
  passport.use(
    new BearerStrategy(
      {
        identityMetadata,
        clientID: AZURE_CLIENT_ID,
        clientSecret: AZURE_CLIENT_SECRET,
        responseType: 'code',
        responseMode: 'query',
        redirectUrl: AZURE_REDIRECT_URL,
        allowHttpForRedirectUrl: process.env.NODE_ENV !== 'production',
        validateIssuer: true,
        isB2C: false,
        issuer: `https://login.microsoftonline.com/${AZURE_TENANT_ID}/v2.0`,
        passReqToCallback: true,
        scope: ['profile', 'email', 'openid'],
        loggingLevel: 'info'
      },
      async (req, profile, done) => {
        try {
          // Map Azure profile to normalized format
          const normalizedProfile = mapAzureProfile({
            ...profile,
            provider: 'azure-ad'
          });
          
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
                role: normalizedProfile.role || 'USER',
                // For OAuth users, set a random password they can't use
                password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
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
          return done(null, user);
        } catch (error) {
          logger.error('Azure authentication error', { error });
          return done(error);
        }
      }
    )
  );
  
  logger.info('Azure AD OAuth strategy configured');
};