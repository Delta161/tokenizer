/**
 * Environment Configuration
 * Handles environment variables
 */

import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

// Define environment variables interface
interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  CORS_ORIGIN: string;
}

// Get environment variables with defaults
export const env: EnvironmentVariables = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tokenizer',
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
};

// Validate required environment variables
export const validateEnv = (): void => {
  const requiredEnvVars: Array<keyof EnvironmentVariables> = [
    'DATABASE_URL',
    'JWT_SECRET',
  ];

  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      console.warn(`Warning: Environment variable ${envVar} is not set.`);
    }
  }

  // Warn about using default JWT_SECRET in production
  if (env.NODE_ENV === 'production' && env.JWT_SECRET === 'super-secret-key') {
    console.warn('Warning: Using default JWT_SECRET in production environment!');
  }
};