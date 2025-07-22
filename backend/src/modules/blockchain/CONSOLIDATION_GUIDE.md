# Network Configuration Consolidation

This guide explains how the network configurations have been consolidated to make the blockchain module the single source of truth.

## What Changed

### Before Consolidation
- Network configurations were duplicated between:
  - `backend/src/modules/blockchain/artifacts/deployments.json` (contract deployment info)
  - `backend/src/modules/blockchain/config/blockchain.config.ts` (network configs)

### Current Consolidation
- Contract artifacts have been moved to `backend/src/modules/blockchain/artifacts/`
- This includes both `Token.json` and `deployments.json`
- The blockchain module now looks for artifacts in this directory first

### After Consolidation
- **Single Source of Truth**: `backend/src/modules/blockchain/config/blockchain.config.ts`
- Contract addresses are automatically loaded from `deployments.json` and merged into network configs
- All network information is centralized in the blockchain module

## How It Works

1. **Automatic Loading**: The `loadDeploymentConfig()` function reads `src/modules/blockchain/artifacts/deployments.json`
2. **Merging**: Contract addresses are merged into the `NETWORKS` configuration
3. **API Access**: New endpoints provide access to contract information:
   - `GET /api/blockchain/contracts` - Get all available contracts for a network
   - `GET /api/blockchain/contracts/:contractName` - Get specific contract address

## New Features

### BlockchainService Methods
```typescript
// Get contract address by name
const address = blockchainService.getContractAddress('PropertyToken', 31337);

// Get all available contracts for a network
const contracts = blockchainService.getAvailableContracts(31337);
```

### API Endpoints
```bash
# Get all contracts for default network
GET /api/blockchain/contracts

# Get all contracts for specific network
GET /api/blockchain/contracts?chainId=31337

# Get specific contract address
GET /api/blockchain/contracts/PropertyToken?chainId=31337
```

## Network Configuration Structure

Each network now includes contract addresses:

```typescript
export const NETWORKS: Record<string, NetworkConfig> = {
  '31337': {
    chainId: 31337,
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorerUrl: 'http://localhost:8545',
    contracts: {
      PropertyToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  }
};
```

## Benefits

1. **No Duplication**: Single source of truth for all network configurations
2. **Automatic Sync**: Contract addresses are automatically loaded from deployments
3. **Type Safety**: Full TypeScript support for network and contract configurations
4. **API Access**: RESTful endpoints for accessing contract information
5. **Error Handling**: Proper validation for missing contracts or networks

## Migration Notes

- Contract artifacts have been moved to `src/modules/blockchain/artifacts/`
- For backward compatibility, the code will still check the old `contracts/` directory if files are not found in the new location
- All network configuration logic now goes through the blockchain module
- Applications should use the new API endpoints or service methods instead of directly accessing artifact files