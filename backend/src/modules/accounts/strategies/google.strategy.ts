/**
 * Google OAuth Strategy
 * Configures Passport for Google OAuth authentication
 */

// External packages
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

// Internal modules - Use relative imports
import { validateAndProcessFullName } from '../validators/auth.validator';
import { authService } from '../services/auth.service';
import type { OAuthProfileDTO } from '../types/auth.types';

// Global utilities
import { logger } from '../../../utils/logger';
import { prisma } from '../../../prisma/client';

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
          // Map Google profile to OAuth DTO format
          const oauthProfile: OAuthProfileDTO = {
            provider: 'google',
            id: profile.id,
            displayName: profile.displayName,
            name: {
              givenName: profile.name?.givenName,
              familyName: profile.name?.familyName
            },
            emails: profile.emails?.map(email => ({
              value: email.value,
              verified: email.verified
            })),
            photos: profile.photos?.map(photo => ({
              value: photo.value
            })),
            _json: profile._json
          };

          // Use auth service to process OAuth login
          const authResponse = await authService.processOAuthLogin(oauthProfile);
          
          // Return the user (Passport will handle the session)
          return done(null, authResponse.user);
        } catch (error) {
          logger.error('Google authentication error', { error });
          return done(error);
        }
      }
    )
  );
  
  logger.info('Google OAuth strategy configured');
};

