---
applyTo: 'backend/src/modules/projects/types/, backend/src/modules/projects/types/*.types.ts'
---

### 📁 Folder: `backend/src/modules/projects/types/`

**Purpose:**  
This folder contains all TypeScript type definitions, interfaces, enums, and data transfer objects (DTOs) for the projects module. These types ensure type safety across the entire project tokenization system and define the shape of data flowing between layers.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - TYPES LAYER

Types are **Layer 7** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → Controller → Service → Utils → 🎯 TYPES**

### ✅ Types Layer Responsibilities (Layer 7)

Types define the data contracts and structures for project operations:

- **Define domain models** representing real estate projects, properties, tokens, and investments
- **Create Data Transfer Objects (DTOs)** for API inputs and outputs with proper serialization
- **Establish database entity types** that match Prisma schema definitions
- **Define business logic types** for calculations, workflows, and complex operations
- **Create utility types** for common patterns, filtering, pagination, and sorting
- **Define error types** for project-specific exception handling
- **Establish configuration types** for project settings, constants, and business rules

### ❌ What Types Should NOT Contain

- **NO implementation logic** - types are pure TypeScript interfaces and type definitions
- **NO runtime code** - no functions, classes, or executable code
- **NO external dependencies** - types should be self-contained
- **NO HTTP-specific types** - avoid Request/Response types (use in controllers)
- **NO database-specific types** - abstract away from Prisma implementation details

### 🔄 Project Types Architecture Pattern

```typescript
// Core domain model
export interface Project {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
  clientId: string;
  
  // Location information
  country: string;
  city: string;
  address: string;
  
  // Financial data
  totalPrice: number;
  tokenPrice: number;
  minInvestment: number;
  tokensAvailablePercent: number;
  
  // ROI metrics
  apr: number;
  irr: number;
  valueGrowth: number;
  
  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

// Input DTO for API operations
export interface CreateProjectInput {
  title: string;
  description: string;
  country: string;
  city: string;
  address: string;
  totalPrice: number;
  tokenPrice: number;
  tokenSymbol: string;
  minInvestment: number;
  tokensAvailablePercent: number;
  apr: number;
  irr: number;
  valueGrowth: number;
}

// Output DTO for API responses
export interface ProjectDTO {
  id: string;
  title: string;
  description: string;
  status: ProjectStatus;
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
  createdAt: string; // ISO date string
  updatedAt: string;
  client?: ClientSummaryDTO;
  token?: TokenSummaryDTO;
  _stats?: ProjectStatsDTO;
}
```

### ✅ Architecture Compliance Rules

1. **Pure TypeScript**: Only interfaces, types, enums, and const assertions - no runtime code
2. **Layer Independence**: Types can be imported by any layer but should not import from implementation layers
3. **Precise Typing**: Use specific types rather than `any` or overly broad types
4. **DTO Separation**: Clear distinction between internal domain models and API DTOs
5. **Serialization Awareness**: DTOs should account for JSON serialization (strings for numbers, ISO dates)
6. **Nullable Handling**: Explicit nullable types where appropriate
7. **Generic Patterns**: Use generics for reusable type patterns across the project domain

### 📊 Project-Specific Type Patterns

#### Domain Enums and Constants
```typescript
export enum ProjectStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING', 
  APPROVED = 'APPROVED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum TokenStandard {
  ERC20 = 'ERC20',
  ERC721 = 'ERC721',
  ERC1155 = 'ERC1155'
}

export const PROJECT_VALIDATION_RULES = {
  MIN_TITLE_LENGTH: 5,
  MAX_TITLE_LENGTH: 200,
  MIN_DESCRIPTION_LENGTH: 50,
  MAX_DESCRIPTION_LENGTH: 5000,
  MIN_PROJECT_VALUE: 50000,
  MAX_PROJECT_VALUE: 100000000,
  MIN_TOKEN_PRICE: 0.01,
  MAX_TOKENS_AVAILABLE_PERCENT: 100,
  MIN_APR: 0,
  MAX_APR: 50
} as const;
```

#### Query and Filter Types
```typescript
export interface ProjectQueryOptions {
  page?: number;
  limit?: number;
  sortBy?: ProjectSortField;
  sortOrder?: SortOrder;
  filters?: ProjectFilters;
  includeRelations?: boolean;
  includeCounts?: boolean;
}

export interface ProjectFilters {
  status?: ProjectStatus[];
  country?: string[];
  city?: string[];
  clientId?: string[];
  minPrice?: number;
  maxPrice?: number;
  minAPR?: number;
  maxAPR?: number;
  createdAfter?: Date;
  createdBefore?: Date;
}

export type ProjectSortField = 
  | 'createdAt'
  | 'updatedAt' 
  | 'title'
  | 'totalPrice'
  | 'tokenPrice'
  | 'apr'
  | 'irr'
  | 'status';

export type SortOrder = 'asc' | 'desc';
```

#### Business Logic Types
```typescript
export interface TokenMetrics {
  totalTokens: number;
  availableTokens: number;
  reservedTokens: number;
  tokenPrice: number;
  minimumPurchase: number;
  maximumPurchase?: number;
  vestingSchedule?: VestingSchedule;
}

export interface ROIProjection {
  projectedAPR: number;
  projectedIRR: number;
  projectedValueGrowth: number;
  projectionPeriod: number; // years
  riskAssessment: RiskLevel;
  confidenceInterval: number; // percentage
}

export interface ProjectStatistics {
  totalProjects: number;
  projectsByStatus: Record<ProjectStatus, number>;
  totalInvestmentValue: number;
  averageProjectValue: number;
  averageAPR: number;
  averageIRR: number;
  topPerformingProjects: ProjectSummaryDTO[];
  recentActivity: ProjectActivityDTO[];
}
```

#### Error and Validation Types
```typescript
export interface ProjectValidationError extends Error {
  code: ProjectErrorCode;
  field?: string;
  value?: unknown;
  constraints?: Record<string, string>;
}

export enum ProjectErrorCode {
  PROJECT_NOT_FOUND = 'PROJECT_NOT_FOUND',
  PROJECT_ACCESS_DENIED = 'PROJECT_ACCESS_DENIED',
  PROJECT_VALIDATION_FAILED = 'PROJECT_VALIDATION_FAILED',
  PROJECT_STATUS_INVALID = 'PROJECT_STATUS_INVALID',
  TOKEN_ALLOCATION_ERROR = 'TOKEN_ALLOCATION_ERROR',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  BLOCKCHAIN_ERROR = 'BLOCKCHAIN_ERROR'
}
```

---

### 📂 Folder Contents

- `project.types.ts` — Core project domain types, DTOs, and business interfaces
- `property.types.ts` — Real estate specific types, valuations, and property metadata
- `token.types.ts` — Tokenization types, blockchain integration, and token economics
- `query.types.ts` — Query interfaces, filters, sorting, and pagination types
- `error.types.ts` — Project-specific error types and validation interfaces
- `analytics.types.ts` — Business intelligence, reporting, and statistics types
- `index.ts` — Barrel file exporting all type definitions with organized namespaces

**Type Responsibilities by File:**

#### `project.types.ts` (Core Domain Types)
```typescript
// Primary domain models
export interface Project { }
export interface ProjectDTO { }
export interface CreateProjectInput { }
export interface UpdateProjectInput { }
export interface ProjectSummaryDTO { }

// Status and lifecycle types
export enum ProjectStatus { }
export interface ProjectWorkflow { }
export interface StatusTransition { }
```

#### `property.types.ts` (Real Estate Domain)
```typescript
// Property-specific data
export interface Property { }
export interface PropertyValuation { }
export interface LocationData { }
export interface MarketAnalysis { }

// Geographic and regulatory
export interface CountryRequirements { }
export interface CityRegulations { }
export interface PropertyLegal { }
```

#### `token.types.ts` (Tokenization & Blockchain)
```typescript
// Token economics
export interface TokenMetrics { }
export interface TokenAllocation { }
export interface TokenDistribution { }

// Blockchain integration
export interface BlockchainConfig { }
export interface SmartContractData { }
export interface TransactionRecord { }
```

#### `query.types.ts` (Data Access Patterns)
```typescript
// Query building
export interface ProjectQueryOptions { }
export interface ProjectFilters { }
export type ProjectSortField = string;

// Pagination and results
export interface PaginatedResult<T> { }
export interface SearchResult<T> { }
```

---

### 🎯 Code Style & Best Practices

#### Interface Design Patterns
```typescript
// Use descriptive, specific names
interface ProjectCreationRequest extends BaseRequest {
  projectData: CreateProjectInput;
  clientContext: ClientContext;
}

// Favor composition over inheritance
interface ProjectWithMetadata extends Project {
  metadata: ProjectMetadata;
  statistics: ProjectStatistics;
}

// Use discriminated unions for variant types
type ProjectEvent = 
  | { type: 'created'; data: ProjectCreatedEvent }
  | { type: 'updated'; data: ProjectUpdatedEvent }
  | { type: 'statusChanged'; data: StatusChangedEvent };
```

#### DTO Design Patterns
```typescript
// Clear input/output distinction
export interface CreateProjectInput {
  // Only required fields for creation
  title: string;
  description: string;
  totalPrice: number;
}

export interface ProjectDTO {
  // All fields including computed ones
  id: string;
  title: string;
  description: string;
  totalPrice: string; // Serialized for API
  createdAt: string; // ISO date
  computedFields: {
    tokenCount: number;
    investmentPotential: number;
  };
}
```

#### Generic Type Patterns
```typescript
// Reusable pagination
export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Reusable query options
export interface QueryOptions<TFilters = unknown, TSortField = string> {
  page?: number;
  limit?: number;
  sortBy?: TSortField;
  sortOrder?: SortOrder;
  filters?: TFilters;
}

// Apply to specific domains
export type ProjectQueryOptions = QueryOptions<ProjectFilters, ProjectSortField>;
```

#### Utility Types
```typescript
// Create variants of base types
export type PartialProjectUpdate = Partial<Pick<Project, 
  | 'title' 
  | 'description' 
  | 'totalPrice' 
  | 'tokenPrice'
>>;

export type ProjectPublicFields = Omit<Project, 
  | 'internalNotes' 
  | 'moderationStatus'
  | 'adminMetadata'
>;

// Create type-safe builders
export type ProjectSortOptions = {
  [K in ProjectSortField]: {
    field: K;
    direction: SortOrder;
  }
}[ProjectSortField];
```

---

### 🧪 Testing & Documentation

#### Type Testing Patterns
```typescript
// Create type tests to ensure contract compliance
type TestProjectDTO = {
  // Ensure all required fields are present
  [K in keyof Required<ProjectDTO>]: ProjectDTO[K]
};

// Test type compatibility
const testProject: CreateProjectInput = {
  title: 'Test',
  description: 'Test description',
  totalPrice: 100000,
  // Ensure all required fields compile
};
```

#### Documentation Standards
```typescript
/**
 * Represents a tokenized real estate investment project
 * 
 * @interface Project
 * @property {string} id - Unique identifier (UUID v4)
 * @property {string} title - Project display name (5-200 chars)
 * @property {ProjectStatus} status - Current lifecycle status
 * @property {number} totalPrice - Total project value in USD
 * @property {number} tokenPrice - Price per token in USD
 * 
 * @example
 * ```typescript
 * const project: Project = {
 *   id: 'proj_123',
 *   title: 'Belgrade Premium Apartments',
 *   status: ProjectStatus.ACTIVE,
 *   totalPrice: 1000000,
 *   tokenPrice: 100
 * };
 * ```
 */
export interface Project {
  // Interface definition...
}
```

---

### 🔒 Security & Data Protection

#### Sensitive Data Handling
```typescript
// Separate public and internal types
export interface ProjectPublicDTO {
  id: string;
  title: string;
  description: string;
  // Only public fields
}

export interface ProjectInternalDTO extends ProjectPublicDTO {
  internalNotes?: string;
  moderationHistory?: ModerationRecord[];
  // Administrative fields
}

// Type guards for data sanitization
export function isPublicProjectField(field: keyof Project): field is keyof ProjectPublicDTO {
  const publicFields: (keyof ProjectPublicDTO)[] = ['id', 'title', 'description'];
  return publicFields.includes(field as keyof ProjectPublicDTO);
}
```

#### Input Validation Types
```typescript
// Define validation constraints as types
export interface ProjectValidationRules {
  title: {
    minLength: 5;
    maxLength: 200;
    pattern: RegExp;
  };
  totalPrice: {
    min: 50000;
    max: 100000000;
    currency: 'USD';
  };
}

// Type-safe validation result
export interface ValidationResult<T> {
  isValid: boolean;
  data?: T;
  errors?: ValidationError[];
}
```

---

### 🚀 Performance Considerations

#### Optimized Type Structures
```typescript
// Lazy-loaded heavy data
export interface ProjectDTO {
  // Always included lightweight fields
  id: string;
  title: string;
  status: ProjectStatus;
  
  // Optional heavy fields
  fullDescription?: string;
  imageUrls?: string[];
  detailedMetrics?: ProjectDetailedMetrics;
}

// Separate summary and detail types
export interface ProjectSummaryDTO {
  id: string;
  title: string;
  status: ProjectStatus;
  totalPrice: string;
  tokenPrice: string;
}

export interface ProjectDetailDTO extends ProjectSummaryDTO {
  description: string;
  fullMetrics: ProjectMetrics;
  relatedData: RelatedProjectData;
}
```

#### Memory-Efficient Patterns
```typescript
// Use branded types for type safety without runtime overhead
export type ProjectId = string & { readonly brand: 'ProjectId' };
export type ClientId = string & { readonly brand: 'ClientId' };
export type TokenAmount = number & { readonly brand: 'TokenAmount' };

// Create efficient lookup types
export type ProjectStatusMap = {
  readonly [K in ProjectStatus]: {
    readonly displayName: string;
    readonly allowedTransitions: readonly ProjectStatus[];
    readonly permissions: readonly UserRole[];
  }
};
```

---

### ⚙️ Intended Use Case

Designed for a **professional real estate tokenization platform** providing:

- **Type-Safe Development**: Comprehensive type coverage preventing runtime errors
- **API Contract Enforcement**: Clear DTOs ensuring consistent client-server communication
- **Business Domain Modeling**: Rich type system capturing complex real estate and tokenization concepts
- **Scalable Architecture**: Flexible type system supporting platform growth and feature expansion
- **Developer Experience**: Self-documenting types with excellent IDE support and auto-completion

This types layer ensures **compile-time safety**, **clear data contracts**, and **maintainable code** for a **production-grade investment platform** handling **real financial transactions** and **regulatory compliance**.

---
