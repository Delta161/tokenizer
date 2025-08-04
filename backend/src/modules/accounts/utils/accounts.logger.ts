import { logger } from '../../../utils/logger';
import { UserRole } from '@prisma/client';
import { KycStatus } from '../types/kyc.types';

/**
 * Logger for accounts module actions
 */
export class AccountsLogger {
  private readonly module = 'AccountsModule';

  constructor() {}

  /**
   * Log user registration
   */
  logUserRegistration(userId: string, email: string, registrationType: string): void {
    logger.info(
      `User registered: ${userId} (${email}) via ${registrationType}`,
      {
        action: 'USER_REGISTRATION',
        userId,
        email,
        registrationType,
        module: this.module,
      }
    );
  }

  /**
   * Log user login
   */
  logUserLogin(userId: string, email: string, loginMethod: string): void {
    logger.info(
      `User login: ${userId} (${email}) via ${loginMethod}`,
      {
        action: 'USER_LOGIN',
        userId,
        email,
        loginMethod,
        module: this.module,
      }
    );
  }

  /**
   * Log user logout
   */
  logUserLogout(userId: string): void {
    logger.info(
      `User logout: ${userId}`,
      {
        action: 'USER_LOGOUT',
        userId,
        module: this.module,
      }
    );
  }

  /**
   * Log user profile update
   */
  logUserProfileUpdate(userId: string, updatedFields: string[]): void {
    logger.info(
      `User ${userId} updated profile fields: ${updatedFields.join(', ')}`,
      {
        action: 'USER_PROFILE_UPDATE',
        userId,
        updatedFields,
        module: this.module,
      }
    );
  }

  /**
   * Log password change
   */
  logPasswordChange(userId: string): void {
    logger.info(
      `User ${userId} changed password`,
      {
        action: 'PASSWORD_CHANGE',
        userId,
        module: this.module,
      }
    );
  }

  /**
   * Log password reset request
   */
  logPasswordResetRequest(email: string): void {
    logger.info(
      `Password reset requested for ${email}`,
      {
        action: 'PASSWORD_RESET_REQUEST',
        email,
        module: this.module,
      }
    );
  }

  /**
   * Log password reset completion
   */
  logPasswordResetComplete(userId: string, email: string): void {
    logger.info(
      `Password reset completed for ${userId} (${email})`,
      {
        action: 'PASSWORD_RESET_COMPLETE',
        userId,
        email,
        module: this.module,
      }
    );
  }

  /**
   * Log KYC submission
   */
  logKycSubmission(userId: string, provider: string): void {
    logger.info(
      `KYC submitted by user ${userId} via provider ${provider}`,
      {
        action: 'KYC_SUBMISSION',
        userId,
        provider,
        module: this.module,
      }
    );
  }

  /**
   * Log KYC status update
   */
  logKycStatusUpdate(userId: string, oldStatus: KycStatus, newStatus: KycStatus, updatedBy?: string): void {
    logger.info(
      `KYC status updated for user ${userId} from ${oldStatus} to ${newStatus}${updatedBy ? ` by ${updatedBy}` : ''}`,
      {
        action: 'KYC_STATUS_UPDATE',
        userId,
        oldStatus,
        newStatus,
        updatedBy,
        module: this.module,
      }
    );
  }

  /**
   * Log KYC verification initiation
   */
  logKycVerificationInitiated(userId: string, provider: string): void {
    logger.info(
      `KYC verification initiated for user ${userId} with provider ${provider}`,
      {
        action: 'KYC_VERIFICATION_INITIATED',
        userId,
        provider,
        module: this.module,
      }
    );
  }

  /**
   * Log KYC verification completion
   */
  logKycVerificationCompleted(userId: string, provider: string, status: KycStatus): void {
    logger.info(
      `KYC verification completed for user ${userId} with provider ${provider}, status: ${status}`,
      {
        action: 'KYC_VERIFICATION_COMPLETED',
        userId,
        provider,
        status,
        module: this.module,
      }
    );
  }

  /**
   * Log authentication error
   */
  logAuthError(email: string, error: string, method: string): void {
    logger.error(
      `Authentication error for ${email} via ${method}: ${error}`,
      {
        action: 'AUTH_ERROR',
        email,
        error,
        method,
        module: this.module,
      }
    );
  }

  /**
   * Log user account deletion
   */
  logUserDeletion(userId: string, reason?: string): void {
    logger.info(
      `User account deleted: ${userId}${reason ? `, reason: ${reason}` : ''}`,
      {
        action: 'USER_DELETION',
        userId,
        reason,
        module: this.module,
      }
    );
  }

  /**
   * Log general account error
   */
  logAccountError(action: string, error: Error | string, context: Record<string, any> = {}): void {
    const errorMessage = error instanceof Error ? error.message : error;
    const errorObj = error instanceof Error ? error : new Error(error);
    
    logger.error(
      `Account error during ${action}: ${errorMessage}`,
      {
        action: 'ACCOUNT_ERROR',
        errorAction: action,
        error: errorMessage,
        ...context,
        module: this.module,
      },
      errorObj
    );
  }
}

// Export a singleton instance
export const accountsLogger = new AccountsLogger();