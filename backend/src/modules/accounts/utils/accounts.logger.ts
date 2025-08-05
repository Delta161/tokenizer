/**
 * Accounts Logger
 * Provides logging functionality for the accounts module
 */

import { logger } from '../../../utils/logger';

/**
 * Simplified logger for the accounts module
 */
export const accountsLogger = {
  /**
   * Log info level message
   */
  info: (message: string, meta?: Record<string, unknown>) => {
    logger.info(`[Accounts] ${message}`, { module: 'AccountsModule', ...meta });
  },

  /**
   * Log error level message
   */
  error: (message: string, error?: Error | string, meta?: Record<string, unknown>) => {
    const errorMessage = error instanceof Error ? error.message : error;
    logger.error(`[Accounts] ${message}`, { 
      module: 'AccountsModule', 
      error: errorMessage,
      ...meta 
    });
  },

  /**
   * Log warning level message
   */
  warn: (message: string, meta?: Record<string, unknown>) => {
    logger.warn(`[Accounts] ${message}`, { module: 'AccountsModule', ...meta });
  },

  /**
   * Log debug level message
   */
  debug: (message: string, meta?: Record<string, unknown>) => {
    logger.debug(`[Accounts] ${message}`, { module: 'AccountsModule', ...meta });
  },

  // Legacy method wrappers for backward compatibility
  logUserRegistration: (userId: string, email: string, registrationType: string) => {
    accountsLogger.info(`User registered: ${userId} (${email}) via ${registrationType}`, {
      action: 'USER_REGISTRATION',
      userId,
      email,
      registrationType
    });
  },

  logUserLogin: (userId: string, email: string, loginMethod: string) => {
    accountsLogger.info(`User login: ${userId} (${email}) via ${loginMethod}`, {
      action: 'USER_LOGIN',
      userId,
      email,
      loginMethod
    });
  },

  logUserLogout: (userId: string) => {
    accountsLogger.info(`User logout: ${userId}`, {
      action: 'USER_LOGOUT',
      userId
    });
  },

  logUserProfileUpdate: (userId: string, updatedFields: string[]) => {
    accountsLogger.info(`User ${userId} updated profile fields: ${updatedFields.join(', ')}`, {
      action: 'USER_PROFILE_UPDATE',
      userId,
      updatedFields
    });
  },

  logPasswordChange: (userId: string) => {
    accountsLogger.info(`User ${userId} changed password`, {
      action: 'PASSWORD_CHANGE',
      userId
    });
  },

  logPasswordResetRequest: (email: string) => {
    accountsLogger.info(`Password reset requested for ${email}`, {
      action: 'PASSWORD_RESET_REQUEST',
      email
    });
  },

  logPasswordResetComplete: (userId: string, email: string) => {
    accountsLogger.info(`Password reset completed for ${userId} (${email})`, {
      action: 'PASSWORD_RESET_COMPLETE',
      userId,
      email
    });
  },

  logKycSubmission: (userId: string, provider: string) => {
    accountsLogger.info(`KYC submitted by user ${userId} via provider ${provider}`, {
      action: 'KYC_SUBMISSION',
      userId,
      provider
    });
  },

  logKycStatusUpdate: (userId: string, oldStatus: string, newStatus: string, updatedBy?: string) => {
    accountsLogger.info(`KYC status updated for user ${userId} from ${oldStatus} to ${newStatus}${updatedBy ? ` by ${updatedBy}` : ''}`, {
      action: 'KYC_STATUS_UPDATE',
      userId,
      oldStatus,
      newStatus,
      updatedBy
    });
  },

  logKycVerificationInitiated: (userId: string, provider: string) => {
    accountsLogger.info(`KYC verification initiated for user ${userId} with provider ${provider}`, {
      action: 'KYC_VERIFICATION_INITIATED',
      userId,
      provider
    });
  },

  logKycVerificationCompleted: (userId: string, provider: string, status: string) => {
    accountsLogger.info(`KYC verification completed for user ${userId} with provider ${provider}, status: ${status}`, {
      action: 'KYC_VERIFICATION_COMPLETED',
      userId,
      provider,
      status
    });
  },

  logAuthError: (email: string, error: string, method: string) => {
    accountsLogger.error(`Authentication error for ${email} via ${method}: ${error}`, error, {
      action: 'AUTH_ERROR',
      email,
      method
    });
  },

  logUserDeletion: (userId: string, reason?: string) => {
    accountsLogger.info(`User account deleted: ${userId}${reason ? `, reason: ${reason}` : ''}`, {
      action: 'USER_DELETION',
      userId,
      reason
    });
  },

  logAccountError: (action: string, error: Error | string, context: Record<string, any> = {}) => {
    accountsLogger.error(`Account error during ${action}`, error, {
      action: 'ACCOUNT_ERROR',
      errorAction: action,
      ...context
    });
  }
};