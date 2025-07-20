/**
 * Environment Configuration
 * Handles environment variables
 */
import dotenv from 'dotenv';
import path from 'path';
// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
// Get environment variables with defaults
export const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '3000', 10),
    DATABASE_URL: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/tokenizer',
    JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key',
    JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
    CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
    // Blockchain related
    ETH_RPC_URL: process.env.ETH_RPC_URL || 'https://sepolia.infura.io/v3/your-infura-key',
    ETH_CHAIN_ID: process.env.ETH_CHAIN_ID || '11155111', // Sepolia testnet
    ETH_GAS_LIMIT: process.env.ETH_GAS_LIMIT || '3000000',
    ETH_GAS_PRICE: process.env.ETH_GAS_PRICE || '5000000000', // 5 gwei
    CONTRACT_SIGNER_PRIVATE_KEY: process.env.CONTRACT_SIGNER_PRIVATE_KEY || '',
    CONTRACT_ARTIFACT_FILE: process.env.CONTRACT_ARTIFACT_FILE || 'Token.json',
    INFURA_API_KEY: process.env.INFURA_API_KEY || '',
};
// Validate required environment variables
export const validateEnv = () => {
    const requiredEnvVars = [
        'DATABASE_URL',
        'JWT_SECRET',
    ];
    // Blockchain variables that should be set in production
    const productionRequiredEnvVars = [
        'CONTRACT_SIGNER_PRIVATE_KEY',
        'INFURA_API_KEY',
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
//# sourceMappingURL=env.js.map