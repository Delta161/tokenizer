/**
 * Azure AD OAuth Strategy
 * Configures Passport for Azure AD authentication
 */

import passport from 'passport';
import { BearerStrategy } from 'passport-azure-ad';
import { mapAzureProfile } from '../utils/oauthProfileMapper';
import { formatFullName } from '../utils/user.utils';
import { logger } from '@utils/logger';
import { prisma } from '../utils/prisma';
import { 
  AzureProfileSchema, 
  AzureEmailSchema, 
  AzurePlaceholderEmailSchema, 
  AzureFullNameSchema, 
  AzureUserCreationSchema, 
  AzureErrorSchema,
  validateAndProcessFullName,
  transformAzureError
} from '../validators/azure.validator';
import { 
  NormalizedProfileSchema, 
  RelaxedNormalizedProfileSchema 
} from '../validators/auth.validator';
import { createUserFromOAuthSchema } from '../validators/user.validator';

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
        // Validate Azure profile using schema
        const azureProfileResult = AzureProfileSchema.safeParse(profile);
        
        if (!azureProfileResult.success) {
          logger.error('Azure profile validation failed', { 
            profile,
            errors: azureProfileResult.error.format()
          });
          return done(new Error('Invalid Azure profile data'));
        }
        
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
        const relaxedValidationResult = RelaxedNormalizedProfileSchema.safeParse(normalizedProfile);
        
        if (!relaxedValidationResult.success) {
          logger.error('Azure profile failed relaxed validation, authentication failed', { 
            profile,
            errors: relaxedValidationResult.error.format()
          });
          return done(new Error('Invalid profile data: Missing critical fields (provider ID or provider)'));
        }
        
        // If we get here, the profile passed relaxed validation
        // Now check if it would pass strict validation (requires email and name fields)
        const strictValidationResult = NormalizedProfileSchema.safeParse(normalizedProfile);
        
        if (!strictValidationResult.success) {
          // Profile passed relaxed but failed strict validation
          // We'll continue but log detailed warnings about missing fields
          logger.warn('Proceeding with incomplete Azure profile', { 
            normalizedProfile,
            errors: strictValidationResult.error.format()
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
        
        // If user found, update last login time
        if (user) {
          logger.info('Found existing user by provider ID', {
            userId: user.id,
            email: user.email,
            providerId: user.providerId
          });
        }
        
        // If user still not found, create new user
        if (!user) {
          try {
            // Validate required fields before attempting to create user
            if (!normalizedProfile.providerId) {
              throw new Error('Missing required providerId');
            }
            
            // Validate and process email using validator functions
            let email = normalizedProfile.email;
            
            // Try to validate the email
            if (email) {
              const validatedEmail = validateAndProcessEmail(email);
              
              if (validatedEmail) {
                email = validatedEmail;
                logger.debug('Email validation successful', { email });
              } else {
                logger.warn('Email validation failed, will use placeholder', {
                  originalEmail: email
                });
                email = null; // Will trigger placeholder generation below
              }
            }
            
            // Generate placeholder email if needed
            if (!email) {
              logger.warn('Azure profile missing or invalid email, using placeholder', {
                providerId: normalizedProfile.providerId,
                originalEmail: normalizedProfile.email
              });
              
              try {
                // Use validator function to generate placeholder email
                email = generatePlaceholderEmail(normalizedProfile.providerId);
                
                logger.debug('Generated placeholder email', { 
                  generatedEmail: email,
                  providerId: normalizedProfile.providerId
                });
              } catch (error) {
                logger.error('Failed to generate placeholder email', {
                  error: error.message
                });
                throw error;
              }
            }
            
            // Final validation check
            const finalValidatedEmail = validateAndProcessEmail(email);
            if (!finalValidatedEmail) {
              logger.error('Final email validation failed', { email });
              throw new Error('Invalid email format after processing');
            }
            email = finalValidatedEmail;
            
            // First check if a user with this providerId exists
            const existingUserWithProviderId = await prisma.user.findFirst({
              where: {
                providerId: normalizedProfile.providerId
              }
            });
            
            if (existingUserWithProviderId) {
              logger.warn('User with this providerId already exists', {
                providerId: normalizedProfile.providerId,
                userId: existingUserWithProviderId.id
              });
              
              // Update last login time
              user = await prisma.user.update({
                where: { id: existingUserWithProviderId.id },
                data: { lastLoginAt: new Date() }
              });
              
              return done(null, user);
            }
            
            // If not found by providerId, check by email
             if (email) {
               const existingUserWithEmail = await prisma.user.findUnique({
                 where: { email: email }
               });
               
               if (existingUserWithEmail) {
                 logger.warn('User with this email exists but with different provider, updating provider info', {
                   email: email,
                   oldProviderId: existingUserWithEmail.providerId,
                   newProviderId: normalizedProfile.providerId,
                   userId: existingUserWithEmail.id
                 });
                 
                 // Update the existing user with the new provider information and refresh login time
                 user = await prisma.user.update({
                   where: { id: existingUserWithEmail.id },
                   data: {
                     authProvider: 'AZURE',
                     providerId: normalizedProfile.providerId,
                     lastLoginAt: new Date()
                   }
                 });
                 
                 return done(null, user);
               }
             }
            
            // Use validator function to validate and format full name
            const fullNameInput = {
              firstName: normalizedProfile.firstName,
              lastName: normalizedProfile.lastName,
              displayName: normalizedProfile.displayName,
              email: email
            };
            
            logger.debug('Full name input data', fullNameInput);
            
            let finalFullName;
            try {
              finalFullName = validateAndProcessFullName(fullNameInput);
              logger.debug('Full name validation successful', { finalFullName });
            } catch (error) {
              logger.error('Full name validation failed', {
                error: error.message,
                input: fullNameInput
              });
              throw error;
            }
            
            // Log the final name for debugging
            logger.debug('Final full name', { finalFullName });
            
            // Log user creation attempt with detailed information
            logger.info('Creating new user from Azure profile', {
              email,
              providerId: normalizedProfile.providerId,
              firstName: normalizedProfile.firstName,
              lastName: normalizedProfile.lastName,
              displayName: normalizedProfile.displayName,
              finalFullName
            });
            
            // Final validation before user creation using validator function
            const userCreationInput = {
              email,
              fullName: finalFullName,
              providerId: normalizedProfile.providerId,
              authProvider: 'AZURE'
            };
            
            logger.debug('User creation validation input', userCreationInput);
            
            try {
              // Use validator function to validate user creation data
              const validatedUserData = validateUserCreationData(userCreationInput);
              logger.debug('User creation validation successful', validatedUserData);
            } catch (validationError) {
              logger.error('User creation validation failed', { 
                error: validationError.message,
                input: userCreationInput
              });
              
              // Log additional context for debugging
              logger.debug('Validation context', {
                rawEmail: normalizedProfile.email,
                processedEmail: email,
                firstName: normalizedProfile.firstName,
                lastName: normalizedProfile.lastName,
                displayName: normalizedProfile.displayName,
                providerId: normalizedProfile.providerId
              });
              
              throw validationError;
            }
            
            try {
              // Double-check for existing users by providerId or email before attempting to create
              // This helps prevent unique constraint violations
              const existingUser = await prisma.user.findFirst({
                where: {
                  OR: [
                    { providerId: normalizedProfile.providerId },
                    { email: email }
                  ]
                }
              });
              
              // Generate a user-friendly error message based on error type
              let userFriendlyMessage = 'Failed to authenticate with Azure';
              
              
              if (existingUser) {
                logger.warn('Found existing user before creation attempt', {
                  providerId: normalizedProfile.providerId,
                  email: email,
                  userId: existingUser.id
                });
                
                // Update the user with the latest information if needed
                try {
                  user = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { 
                      authProvider: 'AZURE',
                      providerId: normalizedProfile.providerId,
                      lastLoginAt: new Date()
                    }
                  });
                  
                  logger.debug('Updated existing user', {
                    userId: user.id,
                    email: user.email,
                    providerId: user.providerId
                  });
                  
                  return done(null, user);
                } catch (updateError) {
                  logger.error('Error updating existing user', {
                    error: (updateError as Error).message,
                    code: (updateError as any).code,
                    userId: existingUser.id
                  });
                  
                  // If update fails, still return the existing user
                  return done(null, existingUser);
                }
              }
              
              // Prepare user data with schema validation
              const userDataInput = {
                email,
                fullName: finalFullName,
                authProvider: 'AZURE',
                providerId: normalizedProfile.providerId,
                avatarUrl: normalizedProfile.avatarUrl,
                role: normalizedProfile.role || 'INVESTOR'
              };
              
              // Validate user data with schema
              const userDataResult = createUserFromOAuthSchema.safeParse(userDataInput);
              
              if (!userDataResult.success) {
                logger.error('User data validation failed', {
                  errors: userDataResult.error.format(),
                  input: userDataInput
                });
                return done(new Error('Invalid user data for creation'), null);
              }
              
              const userData = userDataResult.data;
              
              logger.debug('Validated user data for creation', {
                email: userData.email,
                fullName: userData.fullName,
                providerId: userData.providerId
              });
              
              // Create the user with validated data
              try {
                // Double-check for existing users one more time right before creation
                // This is a final safeguard against race conditions
                const lastCheckUser = await prisma.user.findFirst({
                  where: {
                    OR: [
                      { providerId: normalizedProfile.providerId },
                      { email: email }
                    ]
                  }
                });
                
                if (lastCheckUser) {
                  logger.warn('Found existing user at final check before creation', {
                    providerId: normalizedProfile.providerId,
                    email: email,
                    userId: lastCheckUser.id
                  });
                  
                  // Update the user with the latest information
                  try {
                    user = await prisma.user.update({
                      where: { id: lastCheckUser.id },
                      data: { 
                        authProvider: 'AZURE',
                        providerId: normalizedProfile.providerId,
                        lastLoginAt: new Date()
                      }
                    });
                    return done(null, user);
                  } catch (finalUpdateError) {
                    logger.error('Error updating existing user at final check', {
                      error: (finalUpdateError as Error).message,
                      userId: lastCheckUser.id
                    });
                    // If update fails, still return the existing user
                    return done(null, lastCheckUser);
                  }
                }
                
                // If we get here, no existing user was found, proceed with creation
                user = await prisma.user.create({
                  data: userData
                });
                
                // Log successful creation with all relevant fields
                logger.debug('User creation successful', {
                  userId: user.id,
                  email,
                  fullName: finalFullName,
                  providerId: normalizedProfile.providerId,
                  role: user.role
                });
                
                logger.info('Successfully created new user from Azure profile', { userId: user.id });
              } catch (createError) {
                // Enhanced error handling for Prisma errors using AzureErrorSchema
              const isPrismaError = createError.code && typeof createError.code === 'string';
              
              logger.error('Prisma error during user creation', {
                error: createError.message,
                stack: createError.stack,
                code: createError.code,
                meta: createError.meta,
                isPrismaError,
                errorType: isPrismaError ? 'Prisma' : 'Unknown',
                email,
                fullName: finalFullName,
                providerId: normalizedProfile.providerId,
                displayName: normalizedProfile.displayName
              });
              
              // Use transformAzureError to generate user-friendly error message and action
              if (isPrismaError) {
                const errorInput = {
                  code: createError.code,
                  meta: createError.meta
                };
                
                const errorResult = transformAzureError(errorInput);
                
                if (errorResult) {
                  const { message, action } = errorResult;
                  
                  logger.debug('Error mapped with schema', {
                    originalError: createError.message,
                    friendlyMessage: message,
                    action: action
                  });
                  
                  // For unique constraint violations, try to find the existing user
                  if (createError.code === 'P2002') {
                    const field = createError.meta?.target?.[0] || 'unknown field';
                    
                    if (field === 'email' || field === 'providerId') {
                      try {
                        const existingUser = await prisma.user.findFirst({
                          where: {
                            OR: [
                              { providerId: normalizedProfile.providerId },
                              { email: email }
                            ]
                          }
                        });
                        
                        if (existingUser) {
                          logger.warn('Found existing user after P2002 error', {
                            field,
                            userId: existingUser.id,
                            email: existingUser.email,
                            providerId: existingUser.providerId
                          });
                          
                          // Update the existing user with the latest information
                          try {
                            user = await prisma.user.update({
                              where: { id: existingUser.id },
                              data: { 
                                authProvider: 'AZURE',
                                providerId: normalizedProfile.providerId,
                                lastLoginAt: new Date()
                              }
                            });
                            
                            return done(null, user);
                          } catch (updateError) {
                            logger.error('Error updating existing user after P2002', {
                              error: (updateError as Error).message,
                              userId: existingUser.id
                            });
                            
                            // If update fails, still return the existing user
                            return done(null, existingUser);
                          }
                        }
                      } catch (findError) {
                        logger.error('Error finding existing user after P2002', {
                          error: (findError as Error).message
                        });
                      }
                    }
                    
                    throw new Error(message || `Unique constraint violation on ${field}. User may already exist.`);
                  } else if (createError.code === 'P2000') {
                    const field = createError.meta?.target || 'unknown field';
                    const value = field === 'fullName' ? finalFullName : 
                                 field === 'email' ? email : 
                                 field === 'providerId' ? normalizedProfile.providerId : 'unknown';
                    
                    logger.error('Value too long error', {
                      field,
                      valueLength: value?.length,
                      truncatedValue: value?.substring(0, 20) + '...'
                    });
                    
                    throw new Error(message || `Value too long for ${field}. Please use a shorter value.`);
                  }
                } else {
                  // Schema parsing failed, fall back to basic error handling
                  logger.warn('Error schema parsing failed, using fallback error handling', {
                    error: errorResult.error.format(),
                    originalError: createError
                  });
                }
              }
                
                throw createError; // Re-throw if not a specific handled case
              }
            } catch (prismaError) {
              // Enhanced error handling for all authentication errors using AzureErrorSchema
              const isPrismaError = prismaError.code && typeof prismaError.code === 'string';
              
              // Log detailed error information for debugging
              logger.error('Azure authentication error', {
                error: prismaError.message,
                isPrismaError,
                code: prismaError.code,
                meta: prismaError.meta,
                stack: prismaError.stack,
                email,
                fullName: finalFullName,
                providerId: normalizedProfile.providerId,
                displayName: normalizedProfile.displayName
              });
              
              // Use transformAzureError to generate user-friendly error message
              const errorInput = {
                code: prismaError.code,
                meta: prismaError.meta
              };
              
              const errorResult = transformAzureError(errorInput);
              let userFriendlyMessage = 'Failed to authenticate with Azure';
              
              if (errorResult) {
                userFriendlyMessage = errorResult.message;
                logger.debug('Error mapped with schema', {
                  originalError: prismaError.message,
                  friendlyMessage: userFriendlyMessage,
                  action: errorResult.action
                });
              } else if (isPrismaError) {
                // If AzureErrorSchema parsing failed, fall back to basic error handling
                if (prismaError.code === 'P2002') {
                  const field = prismaError.meta?.target?.[0] || 'unknown field';
                  userFriendlyMessage = field === 'email' 
                    ? 'Authentication failed: A user with this email already exists' 
                    : `Authentication failed: User with this ${field} already exists`;
                } else if (prismaError.code === 'P2000') {
                  const field = prismaError.meta?.target || 'unknown field';
                  userFriendlyMessage = `Authentication failed: The ${field} value is too long`;
                } else {
                  userFriendlyMessage = 'Authentication failed: Database error occurred';
                }
              } else if (prismaError.name === 'ValidationError') {
                // For validation errors, use the original message as it's already user-friendly
                userFriendlyMessage = prismaError.message || 'Authentication failed: Invalid user data provided';
              } else if (prismaError.message.includes('Missing required fields')) {
                userFriendlyMessage = 'Authentication failed: Your profile is missing required information';
              } else if (prismaError.message.includes('Invalid email format')) {
                userFriendlyMessage = 'Authentication failed: Your profile contains an invalid email format';
              }
              
              return done(new Error(userFriendlyMessage));
            }
          } catch (createError: any) {
            // Check for specific Prisma errors
            let errorMessage = createError.message;
            let errorCode = createError.code;
            
            // Handle specific Prisma error codes with more detailed information
            if (errorCode === 'P2002') {
              // Unique constraint violation
              const targetFields = createError.meta?.target?.join(', ') || 'field';
              errorMessage = `User already exists with this ${targetFields}`;
              
              // Additional check to find the existing user
              try {
                const existingUser = await prisma.user.findFirst({
                  where: {
                    OR: [
                      { providerId: normalizedProfile.providerId },
                      { email: email }
                    ]
                  }
                });
                
                if (existingUser) {
                  logger.warn('Found existing user that caused constraint violation', {
                    userId: existingUser.id,
                    email: existingUser.email,
                    providerId: existingUser.providerId,
                    attemptedProviderId: normalizedProfile.providerId
                  });
                  
                  // Update the user with the latest information if needed
                  const updatedUser = await prisma.user.update({
                    where: { id: existingUser.id },
                    data: { 
                      authProvider: 'AZURE',
                      providerId: normalizedProfile.providerId,
                      lastLoginAt: new Date()
                    }
                  });
                  
                  logger.info('Updated existing user after constraint violation', {
                    userId: updatedUser.id,
                    email: updatedUser.email
                  });
                  
                  // Return the existing user instead of an error
                  return done(null, updatedUser);
                }
              } catch (findError) {
                logger.error('Error while trying to find existing user after constraint violation', {
                  findError: findError.message,
                  findErrorStack: findError.stack,
                  originalError: errorMessage
                });
              }
            } else if (errorCode === 'P2000') {
              // Value too long for column
              const targetField = createError.meta?.target || '';
              errorMessage = `Value too long for field ${targetField}`;
              
              logger.error('Data too long error during user creation', {
                field: targetField,
                value: targetField === 'email' ? email : 
                       targetField === 'fullName' ? finalFullName : 
                       targetField === 'providerId' ? normalizedProfile.providerId : 'unknown'
              });
            }
            
            // Log detailed error information with full context
            logger.error('Failed to create user from Azure profile', { 
              error: errorMessage,
              code: errorCode,
              meta: createError.meta,
              stack: createError.stack,
              profile: {
                providerId: normalizedProfile.providerId,
                email: normalizedProfile.email,
                firstName: normalizedProfile.firstName,
                lastName: normalizedProfile.lastName,
                displayName: normalizedProfile.displayName,
                finalFullName: finalFullName
              }
            });
            
            return done(new Error(`Failed to create user: ${errorMessage}`));
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
        // Enhanced error logging with more context and structured information
        logger.error('Azure authentication error', { 
          errorMessage: error.message,
          errorCode: error.code,
          errorStack: error.stack,
          errorName: error.name,
          errorType: typeof error,
          isPrismaError: error.code?.startsWith('P'),
          profileInfo: profile ? {
            oid: profile.oid,
            hasEmail: !!profile.mail || !!profile.userPrincipalName,
            hasName: !!profile.givenName || !!profile.surname || !!profile.displayName,
            email: profile.mail || profile.userPrincipalName,
            displayName: profile.displayName
          } : 'No profile data',
          normalizedProfile: normalizedProfile ? {
            providerId: normalizedProfile.providerId,
            email: normalizedProfile.email,
            firstName: normalizedProfile.firstName,
            lastName: normalizedProfile.lastName,
            displayName: normalizedProfile.displayName
          } : 'Profile not normalized'
        });
        
        // Determine a user-friendly error message based on error type
        let userFriendlyMessage = 'Authentication failed';
        
        if (error.code?.startsWith('P')) {
          // Prisma error
          if (error.code === 'P2002') {
            userFriendlyMessage = 'Account already exists with this email or ID';
          } else if (error.code === 'P2000') {
            userFriendlyMessage = 'One of your profile values is too long';
          } else {
            userFriendlyMessage = 'Database error during authentication';
          }
        } else if (error.message.includes('Missing required fields')) {
          userFriendlyMessage = 'Your profile is missing required information';
        } else if (error.message.includes('Invalid profile data')) {
          userFriendlyMessage = 'Your profile data is invalid or incomplete';
        }
        
        // Add error code for debugging if available
        const errorCode = error.code ? ` (Code: ${error.code})` : '';
        return done(new Error(`${userFriendlyMessage}: ${error.message}${errorCode}`));
      }
    })
  );
  
  logger.info('Azure AD strategy configured');
};

