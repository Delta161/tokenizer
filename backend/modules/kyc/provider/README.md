# KYC Provider Integration Module

This module provides integration with third-party KYC verification providers for the tokenizer platform.

## Overview

The KYC Provider module allows the platform to:

1. Initiate KYC verification with external providers
2. Receive and process webhook callbacks from providers
3. Sync verification status from providers
4. Support multiple providers through a common adapter interface

## Architecture

### Core Components

- **KycProviderAdapter**: Interface for implementing provider-specific adapters
- **KycProviderService**: Service for managing provider interactions
- **KycProviderController**: Controller for handling HTTP requests
- **Webhook Routes**: Routes for receiving provider callbacks

### Provider Integration Flow

1. User initiates KYC verification through the API
2. System creates a verification session with the provider
3. User is redirected to the provider's verification flow
4. Provider sends webhook callbacks with status updates
5. System processes callbacks and updates KYC status

## API Endpoints

### User Endpoints

- `POST /api/kyc/provider/:provider/initiate`: Initiate verification with a provider
  - Requires authentication
  - Body: `{ "redirectUrl": "https://example.com/callback" }`
  - Response: `{ "redirectUrl": "...", "expiresAt": "...", "referenceId": "..." }`

### Admin Endpoints

- `POST /api/kyc/admin/:userId/sync`: Manually sync KYC status from provider
  - Requires admin authentication
  - Response: Updated KYC record

### Webhook Endpoints

- `POST /api/kyc/webhook/:provider`: Receive webhook callbacks from providers
  - No authentication (secured by signature verification)
  - Body: Provider-specific payload
  - Response: `{ "success": true }`

## Supported Providers

Currently, the module includes a mock implementation for the following providers:

- **Sumsub**: Identity verification provider

## Adding a New Provider

To add a new provider:

1. Create a new adapter class implementing the `KycProviderAdapter` interface
2. Add the provider to the `KycProvider` enum
3. Add provider-specific status mappings to `PROVIDER_STATUS_MAPPINGS`
4. Register the adapter in the `KycProviderService` constructor

## Security Considerations

- Webhook signatures are verified using HMAC
- Provider API keys and secrets are stored securely
- All provider interactions are logged for audit purposes

## Testing

Use the provided test script to simulate webhook callbacks:

```bash
node scripts/test-kyc-webhook.js [referenceId]
```

## Database Schema

The module extends the `KycRecord` model with the following fields:

- `provider`: The KYC provider used (e.g., "sumsub")
- `referenceId`: External reference ID from the provider
- `providerData`: Raw provider data for audit/debugging