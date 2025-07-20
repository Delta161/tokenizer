/**
 * Authentication Strategies Index
 * Exports all authentication strategies
 */

export * from './google.strategy';
export * from './azure.strategy';

import { configureGoogleStrategy } from './google.strategy';
import { configureAzureStrategy } from './azure.strategy';

/**
 * Configure all authentication strategies
 */
export const configureAuthStrategies = (): void => {
  // Configure Google OAuth strategy
  configureGoogleStrategy();
  
  // Configure Azure AD strategy
  configureAzureStrategy();
  
  // Add more strategies here as needed
};