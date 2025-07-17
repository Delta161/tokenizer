import * as passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { mapGoogleProfile, validateNormalizedProfile } from '../oauthProfileMapper.js';
import { findOrCreateUser, updateUserLoginMetadata } from '../auth.service.js';

/**
 * Google OAuth strategy configuration
 */
export const configureGoogleStrategy = (): void => {
  const clientID = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const callbackURL = process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback';

  if (!clientID || !clientSecret) {
    console.warn('Google OAuth credentials not configured. Google authentication will be disabled.');
    return;
  }

  passport.use(
    'google',
    new GoogleStrategy(
      {
        clientID,
        clientSecret,
        callbackURL,
        scope: ['profile', 'email'],
        passReqToCallback: true // Enable access to request object
      },
      async (req, accessToken, refreshToken, profile, done) => {
        try {
          console.log('Google OAuth callback received for user:', profile.id);

          // Map Google profile to normalized format
          const normalizedProfile = mapGoogleProfile(profile);
          
          // Validate the normalized profile
          validateNormalizedProfile(normalizedProfile);

          // Find or create user in database
          const user = await findOrCreateUser(normalizedProfile);

          // Update login metadata
          await updateUserLoginMetadata(user.id, {
            ipAddress: req.ip || req.connection?.remoteAddress,
            userAgent: req.get('User-Agent'),
            provider: 'google'
          });

          console.log('Google OAuth authentication successful for:', user.email);
          
          // Return user object to be stored in session or used for JWT
          return done(null, user);
        } catch (error) {
          console.error('Google OAuth authentication error:', error);
          
          // Return error with user-friendly message
          if (error instanceof Error) {
            return done(new Error(`Google authentication failed: ${error.message}`));
          }
          
          return done(new Error('Google authentication failed due to an unexpected error'));
        }
      }
    )
  );

  console.log('Google OAuth strategy configured successfully');
};

/**
 * Google OAuth route options
 */
export const googleAuthOptions = {
  scope: ['profile', 'email'],
  prompt: 'select_account' // Force account selection for better UX
};

/**
 * Google OAuth callback options
 */
export const googleCallbackOptions = {
  failureRedirect: process.env.FRONTEND_URL ? `${process.env.FRONTEND_URL}/login?error=google_auth_failed` : '/login?error=google_auth_failed',
  successRedirect: false // We'll handle success manually to set JWT
};