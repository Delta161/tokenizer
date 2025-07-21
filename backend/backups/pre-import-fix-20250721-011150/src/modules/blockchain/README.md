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

The module uses the following environment variables:

- `ETH_RPC_URL` - Ethereum RPC URL
- `CONTRACT_SIGNER_PRIVATE_KEY` - Private key for signing transactions
- `CONTRACT_ARTIFACT_FILE` - Contract artifact file name
- `ETH_CHAIN_ID` - Ethereum chain ID
- `ETH_GAS_LIMIT` - Gas limit for transactions
- `ETH_GAS_PRICE` - Gas price in gwei

## Dependencies

- ethers.js - For Ethereum interaction
- Prisma - For database operations
- Express - For API routing
- Zod - For request validation