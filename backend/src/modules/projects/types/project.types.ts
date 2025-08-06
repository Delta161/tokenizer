/**
 * Project Module Types
 * TypeScript interfaces and types for the real estate tokenization platform
 * 
 * This file contains all type definitions for the Projects module following
 * the 7-layer backend architecture pattern for enterprise-grade development.
 * 
 * Architecture Layer: Types (Layer 7)
 * Purpose: Define data contracts, DTOs, and domain models
 */

import { PropertyStatus, Token, Blockchain, ProjectStage, Client, Property } from '@prisma/client';

// ==========================================
// TYPE ALIASES AND ENUMS
// ==========================================

/**
 * Project Status - semantic alias for PropertyStatus
 */
export type ProjectStatus = PropertyStatus;

/**
 * Sort order for queries
 */
export type SortOrder = 'asc' | 'desc';

/**
 * Supported project sort fields
 */
export type ProjectSortField = 
  | 'createdAt'
  | 'updatedAt' 
  | 'title'
  | 'totalPrice'
  | 'tokenPrice'
  | 'apr'
  | 'irr'
  | 'status';

// ==========================================
// CORE DOMAIN MODELS
// ==========================================

/**
 * Client summary for related data
 */
export interface ClientSummary {
  id: string;
  companyName: string;
  contactEmail: string;
  status: string;
}

/**
 * Token summary for related data
 */
export interface TokenSummary {
  id: string;
  propertyId: string;
  name: string;
  symbol: string;
  totalSupply: string;
  contractAddress: string | null;
  blockchain: Blockchain;
  isActive: boolean;
}

/**
 * Core Project interface - based on Property model
 * Represents a real estate tokenization project
 */
export interface Project {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: PropertyStatus;
  
  // Location information
  country: string;
  city: string;
  address: string;
  
  // Financial data
  totalPrice: number;
  tokenPrice: number;
  minInvestment: number;
  tokensAvailablePercent: number;
  tokenSymbol: string;
  
  // ROI and analytics metrics
  apr: number;
  irr: number;
  valueGrowth: number;
  
  // Media and presentation
  imageUrls: string[];
  isFeatured: boolean;
  
  // Audit fields
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Project with related entities for complex queries
 */
export interface ProjectWithRelations {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: PropertyStatus;
  country: string;
  city: string;
  address: string;
  totalPrice: number;
  tokenPrice: number;
  minInvestment: number;
  tokensAvailablePercent: number;
  tokenSymbol: string;
  apr: number;
  irr: number;
  valueGrowth: number;
  imageUrls: string[];
  isFeatured: boolean;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  client: ClientSummary;
  tokens: Token[];
  _count?: {
    investments?: number;
    visits?: number;
    documents?: number;
  };
}

// ==========================================
// DATA TRANSFER OBJECTS (DTOs)
// ==========================================

/**
 * Input DTO for creating new projects
 */
export interface CreateProjectInput {
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  tokenPrice: number;
  tokenSymbol: string;
  totalPrice: number;
  minInvestment: number;
  tokensAvailablePercent: number;
  apr: number;
  irr: number;
  valueGrowth: number;
  imageUrls?: string[];
  isFeatured?: boolean;
}

/**
 * Input DTO for updating projects
 */
export interface UpdateProjectInput {
  title?: string;
  description?: string;
  country?: string;
  city?: string;
  address?: string;
  tokenPrice?: number;
  tokenSymbol?: string;
  totalPrice?: number;
  minInvestment?: number;
  tokensAvailablePercent?: number;
  apr?: number;
  irr?: number;
  valueGrowth?: number;
  imageUrls?: string[];
  isFeatured?: boolean;
  status?: PropertyStatus;
}

/**
 * API Output DTO with serialized financial data
 */
export interface ProjectDTO {
  id: string;
  clientId: string;
  title: string;
  description: string;
  status: PropertyStatus;
  country: string;
  city: string;
  address: string;
  totalPrice: string; // Serialized as string for precision
  tokenPrice: string;
  tokenSymbol: string;
  minInvestment: string;
  tokensAvailablePercent: string;
  apr: string;
  irr: string;
  valueGrowth: string;
  imageUrls: string[];
  isFeatured: boolean;
  createdAt: string; // ISO date string
  updatedAt: string;
  client?: ClientSummary;
  tokens?: TokenSummary[];
  _stats?: ProjectStatsDTO;
}

/**
 * Project summary for list views
 */
export interface ProjectSummary {
  id: string;
  title: string;
  description: string;
  country: string;
  city: string;
  tokenPrice: number;
  tokenSymbol: string;
  totalPrice: number;
  minInvestment: number;
  status: PropertyStatus;
  isFeatured: boolean;
  apr: number;
  irr: number;
  valueGrowth: number;
  imageUrls: string[];
  createdAt: Date;
  updatedAt: Date;
  client: ClientSummary;
  tokenCount?: number;
  investmentCount?: number;
  totalInvested?: number;
}

// ==========================================
// QUERY AND FILTER TYPES
// ==========================================

/**
 * Project filters for querying
 */
export interface ProjectFilters {
  status?: PropertyStatus[];
  country?: string[];
  city?: string[];
  clientId?: string[];
  search?: string;
  isFeatured?: boolean;
  minTokenPrice?: number;
  maxTokenPrice?: number;
  minTotalPrice?: number;
  maxTotalPrice?: number;
  minApr?: number;
  maxApr?: number;
  minIrr?: number;
  maxIrr?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

/**
 * Pagination options
 */
export interface ProjectPaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: ProjectSortField;
  sortOrder?: SortOrder;
}

/**
 * Project query options (combines filters and pagination)
 */
export interface ProjectQueryOptions extends ProjectPaginationOptions {
  filters?: ProjectFilters;
  includeRelations?: boolean;
  includeCounts?: boolean;
}

/**
 * Paginated project result
 */
export interface PaginatedProjectResult {
  projects: ProjectSummary[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// ANALYTICS AND STATISTICS TYPES
// ==========================================

/**
 * Project statistics
 */
export interface ProjectStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  draftProjects: number;
  totalValueLocked: number;
  totalInvestments: number;
  featuredProjects: number;
  avgROI: number;
  totalTokensIssued: number;
}

/**
 * Project statistics DTO for API responses
 */
export interface ProjectStatsDTO {
  totalProjects: string;
  activeProjects: string;
  completedProjects: string;
  draftProjects: string;
  totalValueLocked: string;
  totalInvestments: string;
  featuredProjects: string;
  avgROI: string;
  totalTokensIssued: string;
}

/**
 * Token metrics for financial calculations
 */
export interface TokenMetrics {
  totalTokens: number;
  availableTokens: number;
  reservedTokens: number;
  soldTokens: number;
  tokenPrice: number;
  minimumPurchase: number;
  maximumPurchase?: number;
  totalSupply: number;
  circulatingSupply: number;
}

/**
 * ROI projections for investment analysis
 */
export interface ROIProjection {
  year: number;
  projectedValue: number;
  cumulativeReturn: number;
  annualYield: number;
  totalROI: number;
}

// ==========================================
// BUSINESS LOGIC TYPES
// ==========================================

/**
 * Project lifecycle stages
 */
export enum ProjectLifecycleStage {
  PLANNING = 'PLANNING',
  FUNDRAISING = 'FUNDRAISING',
  CONSTRUCTION = 'CONSTRUCTION',
  OPERATIONAL = 'OPERATIONAL',
  COMPLETE = 'COMPLETE'
}

/**
 * Project status transitions validation
 */
export const PROJECT_STATUS_TRANSITIONS: Record<PropertyStatus, PropertyStatus[]> = {
  DRAFT: ['PENDING'],
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['DRAFT', 'PENDING'], // Allow modifications
  REJECTED: ['DRAFT', 'PENDING'] // Allow resubmission
};

/**
 * Project validation rules
 */
export interface ProjectValidationRules {
  title: {
    minLength: number;
    maxLength: number;
  };
  description: {
    minLength: number;
    maxLength: number;
  };
  tokenSymbol: {
    minLength: number;
    maxLength: number;
    pattern: RegExp;
  };
  tokenPrice: {
    min: number;
    max: number;
  };
  totalPrice: {
    min: number;
    max: number;
  };
  minInvestment: {
    min: number;
    max: number;
  };
  apr: {
    min: number;
    max: number;
  };
  irr: {
    min: number;
    max: number;
  };
  tokensAvailablePercent: {
    min: number;
    max: number;
  };
}

/**
 * Default validation rules constants
 */
export const PROJECT_VALIDATION_RULES: ProjectValidationRules = {
  title: {
    minLength: 5,
    maxLength: 200
  },
  description: {
    minLength: 50,
    maxLength: 5000
  },
  tokenSymbol: {
    minLength: 2,
    maxLength: 10,
    pattern: /^[A-Z0-9]+$/
  },
  tokenPrice: {
    min: 0.01,
    max: 1000000
  },
  totalPrice: {
    min: 50000,
    max: 100000000
  },
  minInvestment: {
    min: 1,
    max: 1000000
  },
  apr: {
    min: 0,
    max: 50
  },
  irr: {
    min: 0,
    max: 50
  },
  tokensAvailablePercent: {
    min: 1,
    max: 100
  }
};

// ==========================================
// ERROR TYPES
// ==========================================

/**
 * Base project error class
 */
export class ProjectError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 400
  ) {
    super(message);
    this.name = 'ProjectError';
  }
}

/**
 * Project not found error
 */
export class ProjectNotFoundError extends ProjectError {
  constructor(projectId: string) {
    super(`Project with ID ${projectId} not found`, 'PROJECT_NOT_FOUND', 404);
  }
}

/**
 * Project access denied error
 */
export class ProjectAccessError extends ProjectError {
  constructor(message: string = 'Access denied to project') {
    super(message, 'PROJECT_ACCESS_DENIED', 403);
  }
}

/**
 * Project validation error
 */
export class ProjectValidationError extends ProjectError {
  constructor(message: string, public field?: string) {
    super(message, 'PROJECT_VALIDATION_ERROR', 400);
    this.field = field;
  }
}

/**
 * Invalid project status transition error
 */
export class ProjectStatusTransitionError extends ProjectError {
  constructor(from: PropertyStatus, to: PropertyStatus) {
    super(
      `Invalid status transition from ${from} to ${to}`,
      'INVALID_STATUS_TRANSITION',
      400
    );
  }
}

/**
 * Token symbol conflict error
 */
export class TokenSymbolConflictError extends ProjectError {
  constructor(symbol: string) {
    super(
      `Token symbol '${symbol}' is already in use`,
      'TOKEN_SYMBOL_CONFLICT',
      409
    );
  }
}

// ==========================================
// UTILITY TYPES
// ==========================================

/**
 * Generic API response wrapper
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

/**
 * Generic paginated response
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// ==========================================
// RE-EXPORTS
// ==========================================

export type {
  PropertyStatus,
  Blockchain,
  ProjectStage
} from '@prisma/client';
