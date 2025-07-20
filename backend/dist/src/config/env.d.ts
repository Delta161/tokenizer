/**
 * Environment Configuration
 * Handles environment variables
 */
interface EnvironmentVariables {
    NODE_ENV: string;
    PORT: number;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN: string;
    CORS_ORIGIN: string;
    ETH_RPC_URL: string;
    ETH_CHAIN_ID: string;
    ETH_GAS_LIMIT: string;
    ETH_GAS_PRICE: string;
    CONTRACT_SIGNER_PRIVATE_KEY: string;
    CONTRACT_ARTIFACT_FILE: string;
    INFURA_API_KEY: string;
}
export declare const env: EnvironmentVariables;
export declare const validateEnv: () => void;
export {};
//# sourceMappingURL=env.d.ts.map