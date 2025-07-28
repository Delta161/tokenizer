/**
 * Investor Module
 * 
 * This module handles investor-related functionality including:
 * - Investor profile management
 * - Wallet management
 * - Verification status management
 */

// Export controllers
export { InvestorController } from './controllers/investor.controller.js';

// Export services
export { InvestorService } from './services/investor.service.js';

// Export routes
export { createInvestorRoutes, investorRoutes } from './routes/investor.routes.js';

// Export types
export {
  InvestorApplicationDTO,
  InvestorUpdateDTO,
  InvestorVerificationUpdateDTO,
  WalletCreateDTO,
  WalletVerificationUpdateDTO,
  InvestorPublicDTO,
  WalletPublicDTO,
  InvestorProfileResponse,
  InvestorListResponse,
  InvestorApplicationResponse,
  InvestorUpdateResponse,
  InvestorVerificationUpdateResponse,
  WalletCreateResponse,
  WalletVerificationUpdateResponse,
  InvestorIdParams,
  WalletIdParams,
  InvestorListQuery,
} from './types/investor.types.js';

// Export validators
export {
  investorApplicationSchema,
  investorUpdateSchema,
  investorVerificationUpdateSchema,
  walletCreateSchema,
  walletVerificationUpdateSchema,
  investorIdParamSchema,
  walletIdParamSchema,
  investorListQuerySchema,
  parseInvestorApplication,
  parseInvestorUpdate,
  parseInvestorVerificationUpdate,
  parseWalletCreate,
  parseWalletVerificationUpdate,
  parseInvestorIdParam,
  parseWalletIdParam,
  parseInvestorListQuery
} from './validators/investor.validator.js';

// Export mappers and utilities
export {
  mapInvestorToPublicDTO,
  mapInvestorsToPublicDTOs,
  mapWalletToPublicDTO,
  mapWalletsToPublicDTOs,
  isInvestorVerified,
  hasRequiredVerificationFields,
  isWalletVerified,
  investorLogger
} from './utils/index.js';

// Export error response
export { ErrorResponse, createErrorResponse } from './types/error.types.js';