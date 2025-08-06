---
applyTo: 'backend/src/modules/projects/validators/, backend/src/modules/projects/validators/*.validator.ts'
---

### 📁 Folder: `backend/src/modules/projects/validators/`

**Purpose:**  
This folder contains Zod validation schemas and validation utilities for all project-related operations. Validators ensure data integrity, security, and business rule compliance before data reaches the service layer in the real estate tokenization system.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - VALIDATORS LAYER

Validators are **Layer 2** in the mandatory 7-layer backend architecture:

**Route → Middleware → 🎯 VALIDATOR → Controller → Service → Utils → Types**

### ✅ Validator Responsibilities (Layer 2)

Validators handle comprehensive input validation and sanitization for project operations:

- **Schema Definition**: Define Zod schemas for all project inputs, queries, and parameters
- **Data Validation**: Validate data types, formats, ranges, and business constraints
- **Input Sanitization**: Clean and normalize input data to prevent security vulnerabilities
- **Business Rule Validation**: Enforce project-specific business rules like minimum investments, price ranges
- **Type Inference**: Provide TypeScript type inference from validation schemas
- **Error Standardization**: Generate consistent, detailed validation error messages
- **Cross-Field Validation**: Validate relationships between multiple input fields

### ❌ What Validators Should NOT Do

- **NO database operations** - validators are pure input validation
- **NO business logic execution** - delegate complex business rules to services
- **NO HTTP handling** - validators work with raw data objects
- **NO external API calls** - validators should be synchronous and self-contained
- **NO authentication** - validators assume authentication context is handled elsewhere
- **NO side effects** - validators should be pure functions

### 🔄 Project Validator Pattern Architecture

```typescript
import { z } from 'zod';
import { ProjectStatus, PROJECT_VALIDATION_RULES } from '../types/project.types';

// Core project validation schema
export const CreateProjectSchema = z.object({
  title: z.string()
    .min(PROJECT_VALIDATION_RULES.MIN_TITLE_LENGTH, 'Title too short')
    .max(PROJECT_VALIDATION_RULES.MAX_TITLE_LENGTH, 'Title too long')
    .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Title contains invalid characters'),
    
  description: z.string()
    .min(PROJECT_VALIDATION_RULES.MIN_DESCRIPTION_LENGTH, 'Description too short')
    .max(PROJECT_VALIDATION_RULES.MAX_DESCRIPTION_LENGTH, 'Description too long'),
    
  country: z.string()
    .min(2, 'Country code too short')
    .max(3, 'Country code too long')
    .regex(/^[A-Z]{2,3}$/, 'Invalid country code format'),
    
  city: z.string()
    .min(2, 'City name too short')
    .max(100, 'City name too long')
    .regex(/^[a-zA-Z\s\-']+$/, 'City contains invalid characters'),
    
  address: z.string()
    .min(10, 'Address too short')
    .max(500, 'Address too long'),
    
  totalPrice: z.number()
    .min(PROJECT_VALIDATION_RULES.MIN_PROJECT_VALUE, 'Project value below minimum')
    .max(PROJECT_VALIDATION_RULES.MAX_PROJECT_VALUE, 'Project value exceeds maximum')
    .positive('Price must be positive'),
    
  tokenPrice: z.number()
    .min(PROJECT_VALIDATION_RULES.MIN_TOKEN_PRICE, 'Token price too low')
    .positive('Token price must be positive'),
    
  tokenSymbol: z.string()
    .min(2, 'Token symbol too short')
    .max(10, 'Token symbol too long')
    .regex(/^[A-Z0-9]+$/, 'Token symbol must be uppercase alphanumeric'),
    
  minInvestment: z.number()
    .positive('Minimum investment must be positive'),
    
  tokensAvailablePercent: z.number()
    .min(1, 'At least 1% of tokens must be available')
    .max(PROJECT_VALIDATION_RULES.MAX_TOKENS_AVAILABLE_PERCENT, 'Cannot exceed 100% availability'),
    
  apr: z.number()
    .min(PROJECT_VALIDATION_RULES.MIN_APR, 'APR cannot be negative')
    .max(PROJECT_VALIDATION_RULES.MAX_APR, 'APR too high'),
    
  irr: z.number()
    .min(0, 'IRR cannot be negative')
    .max(100, 'IRR too high'),
    
  valueGrowth: z.number()
    .min(0, 'Value growth cannot be negative')
    .max(1000, 'Value growth too high')
}).refine(
  (data) => data.minInvestment <= data.totalPrice,
  {
    message: 'Minimum investment cannot exceed total project value',
    path: ['minInvestment']
  }
).refine(
  (data) => (data.tokenPrice * (data.totalPrice / data.tokenPrice) * (data.tokensAvailablePercent / 100)) <= data.totalPrice,
  {
    message: 'Token economics do not balance with project value',
    path: ['tokenPrice', 'tokensAvailablePercent']
  }
);

// Infer TypeScript type from schema
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
```

### ✅ Architecture Compliance Rules

1. **Pure Validation**: Validators only validate input data - no business logic or side effects
2. **Zod Integration**: Use Zod 4.0+ for all validation schemas with proper error handling
3. **Type Safety**: Always export inferred types from schemas for use in other layers
4. **Business Constraints**: Encode business rules as validation constraints where appropriate
5. **Security First**: Sanitize all inputs to prevent XSS, injection, and other attacks
6. **Error Quality**: Provide clear, actionable error messages for validation failures
7. **Cross-Field Validation**: Use Zod refinements for complex validation rules involving multiple fields

### 📊 Project-Specific Validation Patterns

#### Parameter Validation
```typescript
// URL parameter validation
export const GetProjectParamsSchema = z.object({
  id: z.string()
    .uuid('Invalid project ID format')
    .describe('Project UUID identifier')
});

// Query parameter validation with defaults
export const GetProjectsQuerySchema = z.object({
  page: z.string()
    .regex(/^\d+$/, 'Page must be a number')
    .transform(Number)
    .refine(n => n > 0, 'Page must be positive')
    .default('1'),
    
  limit: z.string()
    .regex(/^\d+$/, 'Limit must be a number')
    .transform(Number)
    .refine(n => n > 0 && n <= 100, 'Limit must be between 1 and 100')
    .default('10'),
    
  sortBy: z.enum(['createdAt', 'updatedAt', 'title', 'totalPrice', 'tokenPrice'])
    .default('createdAt'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
    
  status: z.array(z.nativeEnum(ProjectStatus))
    .optional(),
    
  country: z.array(z.string().regex(/^[A-Z]{2,3}$/))
    .optional(),
    
  minPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional(),
    
  maxPrice: z.string()
    .regex(/^\d+(\.\d{1,2})?$/, 'Invalid price format')
    .transform(Number)
    .optional()
}).refine(
  (data) => !data.minPrice || !data.maxPrice || data.minPrice <= data.maxPrice,
  {
    message: 'Minimum price cannot be greater than maximum price',
    path: ['minPrice', 'maxPrice']
  }
);
```

#### Update Operation Validation
```typescript
// Partial update validation
export const UpdateProjectSchema = CreateProjectSchema.partial().refine(
  (data) => Object.keys(data).length > 0,
  {
    message: 'At least one field must be provided for update',
    path: []
  }
);

// Status transition validation
export const UpdateProjectStatusSchema = z.object({
  status: z.nativeEnum(ProjectStatus)
    .refine(
      (status) => status !== ProjectStatus.DRAFT,
      'Cannot manually set status to DRAFT'
    ),
    
  reason: z.string()
    .min(10, 'Status change reason must be at least 10 characters')
    .max(500, 'Status change reason too long')
    .optional()
}).refine(
  (data) => {
    // Require reason for rejection or cancellation
    const requiresReason = [ProjectStatus.CANCELLED, ProjectStatus.PAUSED].includes(data.status);
    return !requiresReason || (data.reason && data.reason.length >= 10);
  },
  {
    message: 'Reason is required for cancellation or pausing',
    path: ['reason']
  }
);
```

#### Search and Filter Validation
```typescript
export const SearchProjectsSchema = z.object({
  q: z.string()
    .min(2, 'Search query too short')
    .max(200, 'Search query too long')
    .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Search contains invalid characters'),
    
  page: z.number()
    .int('Page must be an integer')
    .positive('Page must be positive')
    .default(1),
    
  limit: z.number()
    .int('Limit must be an integer')
    .min(1, 'Limit too small')
    .max(50, 'Limit too large')
    .default(10),
    
  sortBy: z.enum(['relevance', 'createdAt', 'totalPrice', 'tokenPrice'])
    .default('relevance'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('desc'),
    
  filters: z.object({
    country: z.array(z.string().regex(/^[A-Z]{2,3}$/)).optional(),
    city: z.array(z.string().min(2).max(100)).optional(),
    status: z.array(z.nativeEnum(ProjectStatus)).optional(),
    minPrice: z.number().positive().optional(),
    maxPrice: z.number().positive().optional()
  }).optional()
});
```

---

### 📂 Folder Contents

- `project.validator.ts` — Core project validation schemas for CRUD operations, queries, and business rules
- `query.validator.ts` — Specialized validation for search, filtering, pagination, and sorting operations  
- `index.ts` — Barrel file exporting all validation schemas with organized namespaces

**Validator Responsibilities by File:**

#### `project.validator.ts` (Core Domain Validation)
```typescript
// Primary CRUD operation schemas
export const CreateProjectSchema = z.object({...});
export const UpdateProjectSchema = z.object({...});
export const GetProjectParamsSchema = z.object({...});
export const UpdateProjectStatusSchema = z.object({...});

// Business rule validation
export const ProjectTokenEconomicsSchema = z.object({...});
export const ProjectLocationSchema = z.object({...});
export const ProjectFinancialMetricsSchema = z.object({...});

// Type exports
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type GetProjectParams = z.infer<typeof GetProjectParamsSchema>;
```

#### `query.validator.ts` (Query & Filter Validation)
```typescript
// Query operation schemas
export const GetProjectsQuerySchema = z.object({...});
export const SearchProjectsSchema = z.object({...});
export const ProjectFiltersSchema = z.object({...});
export const ProjectPaginationSchema = z.object({...});

// Sorting and ordering
export const ProjectSortOptionsSchema = z.object({...});

// Type exports  
export type ProjectQueryOptions = z.infer<typeof GetProjectsQuerySchema>;
export type SearchProjectsQuery = z.infer<typeof SearchProjectsSchema>;
export type ProjectFilters = z.infer<typeof ProjectFiltersSchema>;
```

---

### 🎯 Code Style & Best Practices

#### Schema Design Patterns
```typescript
// Use descriptive error messages
const schema = z.string()
  .min(5, 'Title must be at least 5 characters')
  .max(200, 'Title cannot exceed 200 characters')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Title contains invalid characters');

// Use refinements for business logic
const projectSchema = z.object({
  totalPrice: z.number().positive(),
  tokenPrice: z.number().positive(),
  tokensAvailablePercent: z.number().min(1).max(100)
}).refine(
  (data) => {
    const totalTokens = data.totalPrice / data.tokenPrice;
    const availableTokens = totalTokens * (data.tokensAvailablePercent / 100);
    return availableTokens >= 1; // At least 1 token must be available
  },
  {
    message: 'Token configuration must allow at least 1 purchasable token',
    path: ['tokenPrice', 'tokensAvailablePercent']
  }
);

// Use transforms for data normalization
const normalizedSchema = z.object({
  title: z.string()
    .trim() // Remove whitespace
    .transform(s => s.replace(/\s+/g, ' ')) // Normalize spaces
    .transform(s => s.toLowerCase()) // Normalize case
});
```

#### Advanced Validation Patterns
```typescript
// Conditional validation
const conditionalSchema = z.object({
  projectType: z.enum(['RESIDENTIAL', 'COMMERCIAL']),
  residentialDetails: z.object({
    bedrooms: z.number().int().positive(),
    bathrooms: z.number().int().positive()
  }).optional(),
  commercialDetails: z.object({
    squareFootage: z.number().positive(),
    zoning: z.string().min(2)
  }).optional()
}).refine(
  (data) => {
    if (data.projectType === 'RESIDENTIAL') {
      return data.residentialDetails != null;
    }
    if (data.projectType === 'COMMERCIAL') {
      return data.commercialDetails != null;
    }
    return true;
  },
  {
    message: 'Project type requires corresponding details',
    path: ['residentialDetails', 'commercialDetails']
  }
);

// Array validation with unique constraints
const uniqueArraySchema = z.object({
  tags: z.array(z.string().min(2).max(50))
    .min(1, 'At least one tag required')
    .max(10, 'Maximum 10 tags allowed')
    .refine(
      (tags) => new Set(tags).size === tags.length,
      'Tags must be unique'
    )
});

// Date validation with business rules
const dateRangeSchema = z.object({
  startDate: z.string().datetime('Invalid start date format'),
  endDate: z.string().datetime('Invalid end date format')
}).refine(
  (data) => new Date(data.startDate) < new Date(data.endDate),
  {
    message: 'Start date must be before end date',
    path: ['startDate', 'endDate']
  }
).refine(
  (data) => new Date(data.startDate) >= new Date(),
  {
    message: 'Start date cannot be in the past',
    path: ['startDate']
  }
);
```

#### Type Safety and Exports
```typescript
// Always export inferred types
export type CreateProjectInput = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectInput = z.infer<typeof UpdateProjectSchema>;
export type ProjectQueryParams = z.infer<typeof GetProjectsQuerySchema>;

// Create utility types for common patterns
export type ValidatedProjectData<T extends z.ZodType> = z.infer<T>;
export type ValidationResult<T> = 
  | { success: true; data: T }
  | { success: false; error: z.ZodError };

// Helper functions for validation
export const validateProject = (data: unknown): ValidationResult<CreateProjectInput> => {
  const result = CreateProjectSchema.safeParse(data);
  return result.success 
    ? { success: true, data: result.data }
    : { success: false, error: result.error };
};
```

---

### 🧪 Testing & Documentation

#### Validation Testing Patterns
```typescript
describe('ProjectValidator', () => {
  describe('CreateProjectSchema', () => {
    it('should validate correct project data', () => {
      const validData = {
        title: 'Test Project',
        description: 'A test project with sufficient description length',
        country: 'US',
        city: 'New York',
        address: '123 Main Street, New York, NY',
        totalPrice: 1000000,
        tokenPrice: 100,
        tokenSymbol: 'TEST',
        minInvestment: 1000,
        tokensAvailablePercent: 80,
        apr: 8.5,
        irr: 12.0,
        valueGrowth: 15.5
      };

      const result = CreateProjectSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('should reject invalid project data', () => {
      const invalidData = {
        title: 'Bad', // Too short
        totalPrice: -1000, // Negative
        tokenSymbol: 'invalid symbol!' // Invalid characters
      };

      const result = CreateProjectSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
      expect(result.error?.issues).toHaveLength(3);
    });

    it('should validate cross-field relationships', () => {
      const invalidTokenEconomics = {
        // Valid individual fields but invalid relationship
        totalPrice: 100000,
        tokenPrice: 1000,
        tokensAvailablePercent: 200 // Would exceed total value
      };

      const result = CreateProjectSchema.safeParse(invalidTokenEconomics);
      expect(result.success).toBe(false);
    });
  });
});
```

#### Documentation Standards
```typescript
/**
 * Validation schema for project creation requests
 * 
 * Validates all required fields for creating a new tokenized real estate project,
 * including business rule validation for token economics and investment parameters.
 * 
 * @schema CreateProjectSchema
 * 
 * @example
 * ```typescript
 * const projectData = {
 *   title: 'Belgrade Premium Apartments',
 *   description: 'Luxury residential project in downtown Belgrade...',
 *   country: 'RS',
 *   city: 'Belgrade',
 *   totalPrice: 1000000,
 *   tokenPrice: 100
 * };
 * 
 * const result = CreateProjectSchema.safeParse(projectData);
 * if (result.success) {
 *   // Use result.data with type safety
 * }
 * ```
 * 
 * @validation_rules
 * - Title: 5-200 characters, alphanumeric with basic punctuation
 * - Description: 50-5000 characters for detailed project information
 * - Country: 2-3 character ISO country code
 * - Total Price: $50,000 - $100,000,000 USD
 * - Token Economics: Must allow at least 1 purchasable token
 */
export const CreateProjectSchema = z.object({
  // Schema definition...
});
```

---

### 🔒 Security & Input Sanitization

#### Security-First Validation
```typescript
// Prevent XSS attacks in text fields
const secureTextSchema = z.string()
  .trim()
  .regex(/^[a-zA-Z0-9\s\-_.,()!?]+$/, 'Invalid characters detected')
  .transform(text => text.replace(/<[^>]*>/g, '')) // Strip HTML tags
  .refine(text => !text.includes('<script'), 'Script tags not allowed');

// Sanitize file upload validation
const fileUploadSchema = z.object({
  filename: z.string()
    .min(1, 'Filename required')
    .max(255, 'Filename too long')
    .regex(/^[a-zA-Z0-9\-_.()]+$/, 'Invalid filename characters')
    .refine(name => {
      const allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf'];
      return allowedExtensions.some(ext => name.toLowerCase().endsWith(ext));
    }, 'Invalid file type'),
    
  size: z.number()
    .positive('File size must be positive')
    .max(10 * 1024 * 1024, 'File too large (max 10MB)') // 10MB limit
});

// Prevent injection attacks in search queries
const safeSearchSchema = z.string()
  .trim()
  .min(2, 'Search query too short')
  .max(200, 'Search query too long')
  .regex(/^[a-zA-Z0-9\s\-_.,()]+$/, 'Invalid search characters')
  .transform(query => query.replace(/['"\\;]/g, '')) // Remove dangerous characters
  .refine(query => !query.includes('--'), 'Invalid search pattern');
```

#### Rate Limiting and Abuse Prevention
```typescript
// Validate reasonable limits to prevent abuse
const paginationSchema = z.object({
  page: z.number()
    .int('Page must be integer')
    .min(1, 'Page must be positive')
    .max(10000, 'Page limit exceeded'), // Prevent deep pagination abuse
    
  limit: z.number()
    .int('Limit must be integer')
    .min(1, 'Limit too small')
    .max(100, 'Limit too large') // Prevent large response abuse
});

// Validate bulk operations
const bulkOperationSchema = z.object({
  projectIds: z.array(z.string().uuid())
    .min(1, 'At least one project required')
    .max(50, 'Too many projects (max 50)') // Prevent bulk abuse
    .refine(
      ids => new Set(ids).size === ids.length,
      'Duplicate project IDs not allowed'
    )
});
```

---

### 🚀 Performance Considerations

#### Efficient Validation Patterns
```typescript
// Use lazy validation for expensive operations
const expensiveValidationSchema = z.object({
  basicField: z.string().min(1), // Fast validation first
}).lazy(() => z.object({
  expensiveField: z.string().refine(async (val) => {
    // Only run expensive validation if basic validation passes
    return await expensiveValidationFunction(val);
  })
}));

// Use precompiled regex for repeated validation
const TITLE_REGEX = /^[a-zA-Z0-9\s\-_.,()]+$/;
const COUNTRY_CODE_REGEX = /^[A-Z]{2,3}$/;

const efficientSchema = z.object({
  title: z.string().regex(TITLE_REGEX), // Reuse compiled regex
  country: z.string().regex(COUNTRY_CODE_REGEX)
});

// Cache validation results for identical inputs
const memoizedValidation = memoize((data: string) => {
  return expensiveSchema.parse(data);
});
```

#### Memory-Efficient Schemas
```typescript
// Use discriminated unions to avoid validating unnecessary fields
const projectTypeSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('RESIDENTIAL'),
    bedrooms: z.number(),
    bathrooms: z.number()
  }),
  z.object({
    type: z.literal('COMMERCIAL'),
    squareFootage: z.number(),
    zoning: z.string()
  })
]);

// Stream validation for large datasets
const streamValidationSchema = z.array(z.object({
  id: z.string(),
  data: z.any()
})).transform(items => {
  // Process in chunks to avoid memory issues
  return items.reduce((acc, item, index) => {
    if (index % 100 === 0) {
      // Process in batches of 100
    }
    return acc;
  }, []);
});
```

---

### ⚙️ Intended Use Case

Designed for a **enterprise-grade real estate tokenization platform** requiring:

- **Financial Data Validation**: Precise validation of investment amounts, token economics, and financial projections
- **Security-First Approach**: Comprehensive input sanitization preventing XSS, injection, and abuse
- **Business Rule Enforcement**: Complex validation of real estate investment constraints and tokenization mathematics  
- **Regulatory Compliance**: Validation supporting KYC, AML, and financial regulation requirements
- **Multi-Language Support**: International project support with proper country/city validation
- **Performance Optimization**: Efficient validation for high-throughput financial operations

This validation layer provides **bulletproof input validation**, **type safety**, and **security controls** for a **production financial platform** handling **real money transactions** and **regulatory compliance**.

---
