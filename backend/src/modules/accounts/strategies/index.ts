/**
 * Authentication Strategies Index
 * Exports all authentication strategies
 */

export * from './google.strategy';
// TODO: Implement azure.strategy.ts
// export * from './azure.strategy';

import { configureGoogleStrategy } from './google.strategy';
// TODO: Implement azure strategy
// import { configureAzureStrategy } from './azure.strategy';

/**
 * Configure all authentication strategies
 */
export const configureAuthStrategies = (): void => {
  // Configure Google OAuth strategy
  configureGoogleStrategy();
  
  // TODO: Configure Azure AD strategy when implemented
  // configureAzureStrategy();
  
  // Add more strategies here as needed
};
