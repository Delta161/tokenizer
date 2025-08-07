/**
 * Passport Configuration with Session Management
 * 
 * This file implements Passport serialization/deserialization for     logger.error('❌ Google OAuth error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      profileId: profile.id 
    });
    return done(error, false);on management.
 * Following backend coding instructions for OAuth-only authentication with secure session handling.
 * 
 * IMPORTANT: This configuration is MANDATORY for proper user session management.
 * The serialization/deserialization functions enable Passport to:
 * - Store user identity in sessions (serialize) 
 * - Retrieve user data on subsequent requests (deserialize)
 * - Maintain authentication state across HTTP requests
 * - Enable req.user to be available in route handlers
 */

// External packages
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { OIDCStrategy as AzureStrategy } from 'passport-azure-ad';

// Internal modules - Use relative imports per backend instructions
import { prisma } from '../prisma/client';
import { logger } from '../utils/logger';
import type { User } from '@prisma/client';

// Types for OAuth profiles
interface OAuthProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  provider: 'google' | 'azure';
}

// =============================================================================
// PASSPORT SERIALIZATION/DESERIALIZATION (MANDATORY FOR SESSION MANAGEMENT)
// =============================================================================

/**
 * Serialization - Store user ID in session
 * This function determines what data from the user object should be stored in the session.
 * Only the user ID is stored to keep sessions lightweight.
 */
passport.serializeUser((user: any, done) => {
  logger.debug('🔄 Serializing user for session storage', { 
    userId: user.id, 
    email: user.email 
  });
  done(null, user.id);
});

/**
 * Deserialization - Retrieve full user object from database using session ID
 * This function is called on every authenticated request to reconstruct the user object.
 * It takes the user ID from the session and fetches the complete user data from database.
 */
passport.deserializeUser(async (id: string, done) => {
  try {
    logger.debug('🔄 Deserializing user from session', { userId: id });
    
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        investor: true,
        client: true,
        kycRecord: true
      }
    });
    
    if (!user) {
      logger.warn('❌ User not found during deserialization', { userId: id });
      return done(new Error('User not found during session deserialization'), false);
    }
    
    // Update last login timestamp
    await prisma.user.update({
      where: { id },
      data: { lastLoginAt: new Date() }
    });
    
    logger.debug('✅ User deserialized successfully', { 
      userId: user.id, 
      email: user.email,
      role: user.role 
    });
    
    done(null, user);
  } catch (error) {
    logger.error('❌ Deserialization error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      userId: id 
    });
    done(error, false);
  }
});

// =============================================================================
// GOOGLE OAUTH STRATEGY
// =============================================================================

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: '/api/v1/auth/google/callback',
  scope: ['profile', 'email']
}, async (accessToken, refreshToken, profile, done) => {
  try {
    logger.info('🔄 Processing Google OAuth callback', { 
      profileId: profile.id,
      email: profile.emails?.[0]?.value 
    });
    
    const oauthProfile: OAuthProfile = {
      id: profile.id,
      email: profile.emails?.[0]?.value || '',
      name: profile.displayName || 'Google User',
      picture: profile.photos?.[0]?.value,
      provider: 'google'
    };
    
    const user = await findOrCreateOAuthUser(oauthProfile);
    
    logger.info('✅ Google OAuth user processed successfully', { 
      userId: user.id,
      email: user.email 
    });
    
    return done(null, user);
  } catch (error) {
    logger.error('❌ Google OAuth strategy error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      profileId: profile.id 
    });
    return done(error, false);
  }
}));

// =============================================================================
// AZURE OAUTH STRATEGY  
// =============================================================================

passport.use(new AzureStrategy({
  identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid_configuration`,
  clientID: process.env.AZURE_CLIENT_ID!,
  clientSecret: process.env.AZURE_CLIENT_SECRET!,
  responseType: 'code',
  responseMode: 'form_post',
  redirectUrl: process.env.AZURE_REDIRECT_URL!,
  allowHttpForRedirectUrl: true, // Allow HTTP in development
  scope: ['profile', 'offline_access', 'https://graph.microsoft.com/mail.read'],
  validateIssuer: false,
  passReqToCallback: false
}, async (iss: any, sub: any, profile: any, accessToken: any, refreshToken: any, done: any) => {
  try {
    logger.info('🔄 Processing Azure OAuth callback', { 
      sub: sub,
      email: profile.upn 
    });
    
    const oauthProfile: OAuthProfile = {
      id: sub,
      email: profile.upn || profile.preferred_username || '',
      name: profile.displayName || 'Azure User',
      picture: undefined, // Azure doesn't provide profile pictures in this flow
      provider: 'azure'
    };
    
    const user = await findOrCreateOAuthUser(oauthProfile);
    
    logger.info('✅ Azure OAuth user processed successfully', { 
      userId: user.id,
      email: user.email 
    });
    
    return done(null, user);
  } catch (error) {
    logger.error('❌ Azure OAuth strategy error', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      sub: sub 
    });
    return done(error, false);
  }
}));

// =============================================================================
// OAUTH USER MANAGEMENT HELPER FUNCTIONS
// =============================================================================

/**
 * Find existing user or create new OAuth user
 * This function handles the core OAuth user logic following the service layer pattern.
 */
async function findOrCreateOAuthUser(profile: OAuthProfile): Promise<User> {
  try {
    logger.debug('🔍 Looking for existing user', { 
      email: profile.email,
      provider: profile.provider 
    });
    
    // First, try to find user by email
    let user = await prisma.user.findUnique({
      where: { email: profile.email },
      include: {
        investor: true,
        client: true
      }
    });
    
    if (user) {
      logger.debug('👤 Existing user found, updating OAuth info', { 
        userId: user.id,
        currentProvider: user.authProvider 
      });
      
      // Update existing user with latest OAuth information
      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          avatarUrl: profile.picture || user.avatarUrl,
          authProvider: profile.provider.toUpperCase() as any,
          providerId: profile.id,
          lastLoginAt: new Date()
        },
        include: {
          investor: true,
          client: true
        }
      });
    } else {
      logger.info('🆕 Creating new OAuth user', { 
        email: profile.email,
        provider: profile.provider 
      });
      
      // Create new user with OAuth information
      user = await prisma.user.create({
        data: {
          email: profile.email,
          fullName: profile.name,
          avatarUrl: profile.picture,
          authProvider: profile.provider.toUpperCase() as any,
          providerId: profile.id,
          role: 'INVESTOR', // Default role as per business rules
          lastLoginAt: new Date()
        },
        include: {
          investor: true,
          client: true
        }
      });
      
      // Create associated investor profile for new users
      await prisma.investor.create({
        data: {
          userId: user.id,
          nationality: 'Unknown', // Will be updated during KYC
          isVerified: false
        }
      });
      
      logger.info('✅ New OAuth user created successfully', { 
        userId: user.id,
        email: user.email,
        provider: profile.provider 
      });
    }
    
    return user;
  } catch (error) {
    logger.error('❌ Error in findOrCreateOAuthUser', { 
      error: error instanceof Error ? error.message : 'Unknown error',
      email: profile.email,
      provider: profile.provider 
    });
    throw error;
  }
}

// Export passport instance for use in app configuration
export default passport;
