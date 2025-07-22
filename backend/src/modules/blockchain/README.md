# Blockchain Module

## Overview
The Blockchain Module provides a comprehensive interface for interacting with blockchain networks and smart contracts. It handles token operations, contract validation, and transaction management for the tokenizer platform.

## Features
- ERC20 token management (metadata, balances, transfers)
- Smart contract validation
- Transaction tracking and receipt verification
- Gas price estimation
- Network configuration management
- Event subscription for contract events

## API Endpoints
### Public Endpoints

- `GET /validate/:contractAddress` - Validate a smart contract address
- `GET /metadata/:contractAddress` - Get token metadata
- `GET /balance` - Get token balance for a wallet
- `GET /gas-price` - Get current gas price
- `GET /network-config` - Get network configuration
- `GET /contracts` - Get all available contracts for a network
- `GET /contracts/:contractName` - Get specific contract address by name

### Protected Endpoints (Authentication Required)
- `POST /transaction-receipt` - Get transaction receipt details

### Admin Endpoints (Admin Role Required)
- `POST /mint` - Mint tokens to a recipient
- `POST /transfer` - Transfer tokens to a recipient

## Usage

To initialize the blockchain module in your application:

```typescript
import { initBlockchainModule } from './modules/blockchain';

// In your Express app setup
app.use('/api/blockchain', initBlockchainModule());
```

## Configuration

The module serves as the **single source of truth** for all network configurations, automatically loading contract addresses from `src/modules/blockchain/artifacts/deployments.json` and merging them with network settings.

### Contract Artifacts

Contract artifacts are stored in the `src/modules/blockchain/artifacts/` directory:
- `Token.json` - The ERC20 token contract ABI
- `deployments.json` - Network-specific contract addresses

### Environment Variables

- `ETH_RPC_URL` - Ethereum RPC URL
- `CONTRACT_SIGNER_PRIVATE_KEY` - Private key for signing transactions
- `CONTRACT_ARTIFACT_FILE` - Contract artifact file name
- `ETH_CHAIN_ID` - Ethereum chain ID
- `ETH_GAS_LIMIT` - Gas limit for transactions
- `ETH_GAS_PRICE` - Gas price in gwei
- `DEFAULT_CHAIN_ID` - Default chain ID for operations
- `MAINNET_RPC_URL`, `GOERLI_RPC_URL`, `SEPOLIA_RPC_URL` - Network-specific RPC URLs
- `POLYGON_RPC_URL`, `MUMBAI_RPC_URL` - Polygon network RPC URLs

### Network Configuration Consolidation

The module automatically loads contract deployment information and provides:
- Unified network configurations with contract addresses
- API endpoints for accessing contract information
- Type-safe access to network and contract data

See `CONSOLIDATION_GUIDE.md` for detailed information about the consolidation process.

## Dependencies

- ethers.js - For Ethereum interaction
- Prisma - For database operations
- Express - For API routing
- Zod - For request validation