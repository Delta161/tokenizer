/**
 * Google OAuth Strategy
 * Configures Passport for Google OAuth authentication
 */

import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { PrismaClient } from '@prisma/client';
import { mapGoogleProfile, validateNormalizedProfile } from '../oauthProfileMapper';
import { logger } from '../../../utils/logger';

const prisma = new PrismaClient();

// Default callback URL
const DEFAULT_CALLBACK_URL = 'http://localhost:3000/api/v1/auth/google/callback';

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
  failureRedirect: '/api/v1/auth/error?error=google_auth_failed'
};

/**
 * Configure Google OAuth strategy for Passport
 */
export const configureGoogleStrategy = (): void => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || DEFAULT_CALLBACK_URL;
  
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
            user = await prisma.user.create({
              data: {
                email: normalizedProfile.email,
                firstName: normalizedProfile.firstName,
                lastName: normalizedProfile.lastName,
                authProvider: 'GOOGLE',
                providerId: normalizedProfile.providerId,
                avatarUrl: normalizedProfile.avatarUrl,
                role: normalizedProfile.role || 'USER',
                // For OAuth users, set a random password they can't use
                password: Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10)
              }
            });
            
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