/**
 * Google OAuth Strategy
 * Configures Passport for Google OAuth authentication
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { mapGoogleProfile, validateNormalizedProfile } from '../utils/oauthProfileMapper';
import { logger } from '@utils/logger';
import { prisma } from '../utils/prisma';
import { validateAndProcessFullName } from '../validators/google.validator';

// Default callback URL is configured in .env as GOOGLE_CALLBACK_URL

/**
 * Google authentication options
 */
export const googleAuthOptions = {
  scope: ['profile', 'email'],
  prompt: 'select_account'
};

/**
 * Google callback options
 */
export const googleCallbackOptions = {
  failureRedirect: process.env.GOOGLE_AUTH_ERROR_REDIRECT_PATH || '/api/v1/auth/error?error=google_auth_failed'
};

/**
 * Configure Google OAuth strategy for Passport
 */
export const configureGoogleStrategy = (): void => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL;
  
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    logger.warn('Google OAuth credentials not configured. Google authentication will not work.');
    return;
  }
  
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          // Map Google profile to normalized format
          const normalizedProfile = mapGoogleProfile(profile);
          
          // Validate profile
          if (!validateNormalizedProfile(normalizedProfile)) {
            logger.error('Invalid Google profile', { profile });
            return done(new Error('Invalid profile data'));
          }
          
          // Find existing user by provider ID
          let user = await prisma.user.findFirst({
            where: {
              authProvider: 'GOOGLE',
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
                  authProvider: 'GOOGLE',
                  providerId: normalizedProfile.providerId
                }
              });
              
              logger.info('Updated existing user with Google provider', {
                userId: user.id,
                email: user.email
              });
            }
          }
          
          // If user still not found, create new user
          if (!user) {
            try {
              // Use the validator to process and validate fullName
              const fullName = validateAndProcessFullName({
                firstName: normalizedProfile.firstName,
                lastName: normalizedProfile.lastName,
                displayName: normalizedProfile.displayName,
                email: normalizedProfile.email
              });
              
              // Log the fullName to ensure it's being set correctly
              logger.info('Creating new user with fullName', { fullName, email: normalizedProfile.email });
              
              // Prepare user data
              const userData = {
                email: normalizedProfile.email,
                fullName: fullName,
                authProvider: 'GOOGLE',
                providerId: normalizedProfile.providerId,
                avatarUrl: normalizedProfile.avatarUrl,
                role: normalizedProfile.role || 'INVESTOR'
              };
              
              // Log the complete user data before creation
              logger.debug('User data for creation', userData);
              
              user = await prisma.user.create({
                data: userData
              });
              
              logger.info('Successfully created user with fullName', { fullName, email: normalizedProfile.email });
            } catch (createError) {
              logger.error('Error creating user from Google profile', { error: createError });
              return done(createError as Error);
            }
            
            logger.info('Created new user from Google OAuth', {
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
          logger.error('Google authentication error', { error });
          return done(error);
        }
      }
    )
  );
  
  logger.info('Google OAuth strategy configured');
};

