---
applyTo: 'backend/src/modules/projects/utils/, backend/src/modules/projects/utils/*.ts'
---

### 📁 Folder: `backend/src/modules/projects/utils/`

**Purpose:**  
This folder contains utility functions, helper modules, data transformers, and shared logic for the projects module. Utils provide reusable, pure functions that support the business logic without containing business rules themselves.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - UTILS LAYER

Utils are **Layer 6** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → Controller → Service → 🎯 UTILS → Types**

### ✅ Utils Responsibilities (Layer 6)

Utils provide pure, reusable functions and data transformations:

- **Data Transformation**: Convert between different data formats, DTOs, and database entities
- **Mathematical Calculations**: Perform complex calculations for tokenization, ROI, and financial metrics
- **Data Mapping**: Transform database models to API-friendly DTOs and vice versa
- **Formatting Utilities**: Format dates, currencies, percentages, and other display values
- **Validation Helpers**: Pure functions for complex validation logic used across the module
- **Business Calculations**: Implement mathematical formulas for real estate and investment calculations
- **Data Serialization**: Handle JSON serialization, decimal precision, and data type conversions

### ❌ What Utils Should NOT Do

- **NO business logic** - utils are pure functions without business context or rules
- **NO database operations** - utils never interact with Prisma or external data sources
- **NO HTTP handling** - utils work with raw data, not requests or responses
- **NO side effects** - utils should be pure functions with predictable outputs
- **NO authentication** - utils assume data is already validated and authorized
- **NO external API calls** - utils focus on data transformation and calculation
- **NO state management** - utils are stateless and don't maintain any internal state

### 🔄 Project Utils Architecture Pattern

```typescript
// Mathematical calculations for tokenization
export class TokenCalculator {
  /**
   * Calculate total tokens based on project value and token price
   * Pure function with no side effects
   */
  static calculateTotalTokens(totalPrice: number, tokenPrice: number): number {
    if (tokenPrice <= 0) {
      throw new Error('Token price must be positive');
    }
    
    return Math.floor(totalPrice / tokenPrice);
  }

  /**
   * Calculate available tokens for public sale
   */
  static calculateAvailableTokens(
    totalTokens: number, 
    availablePercent: number
  ): number {
    if (availablePercent < 0 || availablePercent > 100) {
      throw new Error('Available percent must be between 0 and 100');
    }
    
    return Math.floor(totalTokens * (availablePercent / 100));
  }

  /**
   * Calculate ROI projections based on investment parameters
   */
  static calculateROIProjection(
    initialValue: number,
    projectedValue: number,
    timeHorizonYears: number,
    dividendYield: number = 0
  ): ROIProjection {
    const capitalGains = ((projectedValue - initialValue) / initialValue) * 100;
    const annualCapitalGains = capitalGains / timeHorizonYears;
    const totalReturn = annualCapitalGains + dividendYield;

    return {
      capitalGainsPercent: parseFloat(capitalGains.toFixed(2)),
      annualizedReturn: parseFloat(annualCapitalGains.toFixed(2)),
      totalAnnualReturn: parseFloat(totalReturn.toFixed(2)),
      dividendYield: parseFloat(dividendYield.toFixed(2)),
      timeHorizonYears
    };
  }
}

// Data mapping utilities
export class ProjectMapper {
  /**
   * Convert database entity to API DTO
   * Handles decimal serialization and date formatting
   */
  static toProjectDTO(entity: ProjectEntity): ProjectDTO {
    return {
      id: entity.id,
      title: entity.title,
      description: entity.description,
      status: entity.status,
      country: entity.country,
      city: entity.city,
      address: entity.address,
      
      // Serialize Decimal fields as strings for precision
      totalPrice: entity.totalPrice.toString(),
      tokenPrice: entity.tokenPrice.toString(),
      minInvestment: entity.minInvestment.toString(),
      tokensAvailablePercent: entity.tokensAvailablePercent.toString(),
      apr: entity.apr.toString(),
      irr: entity.irr.toString(),
      valueGrowth: entity.valueGrowth.toString(),
      
      // Format dates as ISO strings
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
      
      // Include related data if present
      client: entity.client ? ClientMapper.toSummaryDTO(entity.client) : undefined,
      token: entity.token ? TokenMapper.toSummaryDTO(entity.token) : undefined
    };
  }

  /**
   * Convert API input to database-ready format
   */
  static fromCreateInput(input: CreateProjectInput): ProjectCreateData {
    return {
      title: input.title.trim(),
      description: input.description.trim(),
      country: input.country.toUpperCase(),
      city: input.city.trim(),
      address: input.address.trim(),
      
      // Convert numbers to Decimal for database storage
      totalPrice: new Decimal(input.totalPrice),
      tokenPrice: new Decimal(input.tokenPrice),
      minInvestment: new Decimal(input.minInvestment),
      tokensAvailablePercent: new Decimal(input.tokensAvailablePercent),
      apr: new Decimal(input.apr),
      irr: new Decimal(input.irr),
      valueGrowth: new Decimal(input.valueGrowth),
      
      tokenSymbol: input.tokenSymbol.toUpperCase(),
      status: ProjectStatus.DRAFT
    };
  }
}
```

### ✅ Architecture Compliance Rules

1. **Pure Functions**: All utility functions must be pure - same input produces same output
2. **No Side Effects**: Utils cannot modify external state, make API calls, or access databases
3. **Type Safety**: Use strong typing for all inputs and outputs with proper error handling
4. **Stateless Design**: Utils should not maintain any internal state or configuration
5. **Single Responsibility**: Each utility function should have one clear, focused purpose
6. **Reusability**: Utils should be generic enough to be reused across different contexts
7. **Error Handling**: Throw meaningful errors for invalid inputs with clear error messages

### 📊 Project-Specific Utility Patterns

#### Financial Calculations
```typescript
export class FinancialCalculator {
  /**
   * Calculate Internal Rate of Return (IRR) for project investment
   */
  static calculateIRR(
    initialInvestment: number,
    cashFlows: number[],
    timePeriodsYears: number[]
  ): number {
    // Newton-Raphson method for IRR calculation
    let irr = 0.1; // Initial guess of 10%
    const tolerance = 0.0001;
    const maxIterations = 100;

    for (let i = 0; i < maxIterations; i++) {
      const npv = this.calculateNPV(initialInvestment, cashFlows, timePeriodsYears, irr);
      const npvDerivative = this.calculateNPVDerivative(initialInvestment, cashFlows, timePeriodsYears, irr);
      
      const newIRR = irr - (npv / npvDerivative);
      
      if (Math.abs(newIRR - irr) < tolerance) {
        return parseFloat((newIRR * 100).toFixed(2)); // Return as percentage
      }
      
      irr = newIRR;
    }
    
    throw new Error('IRR calculation did not converge');
  }

  /**
   * Calculate Net Present Value (NPV)
   */
  static calculateNPV(
    initialInvestment: number,
    cashFlows: number[],
    timePeriodsYears: number[],
    discountRate: number
  ): number {
    let npv = -initialInvestment;
    
    for (let i = 0; i < cashFlows.length; i++) {
      npv += cashFlows[i] / Math.pow(1 + discountRate, timePeriodsYears[i]);
    }
    
    return npv;
  }

  /**
   * Calculate compound annual growth rate (CAGR)
   */
  static calculateCAGR(
    beginningValue: number,
    endingValue: number,
    numberOfYears: number
  ): number {
    if (beginningValue <= 0 || endingValue <= 0 || numberOfYears <= 0) {
      throw new Error('All values must be positive for CAGR calculation');
    }
    
    const cagr = Math.pow(endingValue / beginningValue, 1 / numberOfYears) - 1;
    return parseFloat((cagr * 100).toFixed(2));
  }
}
```

#### Data Transformation Utilities
```typescript
export class DataTransformer {
  /**
   * Convert Prisma Decimal to number for calculations
   */
  static decimalToNumber(decimal: Decimal | null | undefined): number {
    if (!decimal) return 0;
    return decimal.toNumber();
  }

  /**
   * Convert number to Prisma Decimal for database storage
   */
  static numberToDecimal(num: number | string): Decimal {
    return new Decimal(num);
  }

  /**
   * Format currency for display
   */
  static formatCurrency(
    amount: number | string | Decimal,
    currency: string = 'USD',
    locale: string = 'en-US'
  ): string {
    const numAmount = typeof amount === 'number' 
      ? amount 
      : parseFloat(amount.toString());

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(numAmount);
  }

  /**
   * Format percentage for display
   */
  static formatPercentage(
    value: number | string | Decimal,
    decimals: number = 2
  ): string {
    const numValue = typeof value === 'number' 
      ? value 
      : parseFloat(value.toString());

    return `${numValue.toFixed(decimals)}%`;
  }

  /**
   * Parse and validate numeric input from strings
   */
  static parseNumericInput(input: string): number {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    if (isNaN(parsed)) {
      throw new Error(`Invalid numeric input: ${input}`);
    }
    
    return parsed;
  }

  /**
   * Normalize geographic data
   */
  static normalizeGeoData(country: string, city: string): {
    country: string;
    city: string;
    countryCode: string;
  } {
    const normalizedCountry = country.trim().toUpperCase();
    const normalizedCity = city.trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');

    // Map country names to ISO codes
    const countryCode = this.getCountryCode(normalizedCountry);

    return {
      country: normalizedCountry,
      city: normalizedCity,
      countryCode
    };
  }
}
```

#### Validation Helper Utilities
```typescript
export class ValidationHelpers {
  /**
   * Validate token economics make sense
   */
  static validateTokenEconomics(
    totalPrice: number,
    tokenPrice: number,
    tokensAvailablePercent: number,
    minInvestment: number
  ): ValidationResult {
    const errors: string[] = [];

    const totalTokens = Math.floor(totalPrice / tokenPrice);
    const availableTokens = Math.floor(totalTokens * (tokensAvailablePercent / 100));
    const minTokensNeeded = Math.ceil(minInvestment / tokenPrice);

    if (totalTokens < 1) {
      errors.push('Token price too high - results in less than 1 total token');
    }

    if (availableTokens < 1) {
      errors.push('Available percentage too low - results in less than 1 available token');
    }

    if (minTokensNeeded > availableTokens) {
      errors.push('Minimum investment requires more tokens than available');
    }

    const totalValue = totalTokens * tokenPrice;
    const availableValue = availableTokens * tokenPrice;
    
    if (Math.abs(totalValue - totalPrice) > 1) {
      errors.push('Token economics do not balance with project value');
    }

    return {
      isValid: errors.length === 0,
      errors,
      calculations: {
        totalTokens,
        availableTokens,
        minTokensNeeded,
        totalValue,
        availableValue
      }
    };
  }

  /**
   * Validate investment metrics are reasonable
   */
  static validateInvestmentMetrics(
    apr: number,
    irr: number,
    valueGrowth: number,
    projectType: string,
    location: string
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for unrealistic returns
    if (apr > 25) {
      warnings.push('APR above 25% may be unrealistic for real estate');
    }

    if (irr > 30) {
      warnings.push('IRR above 30% may be unrealistic for real estate');
    }

    if (valueGrowth > 50) {
      warnings.push('Value growth above 50% annually may be unrealistic');
    }

    // Check for inconsistent metrics
    if (irr < apr) {
      warnings.push('IRR typically should be higher than APR for real estate investments');
    }

    if (apr < 1 && irr < 1) {
      errors.push('Both APR and IRR below 1% may indicate data entry error');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
```

---

### 📂 Folder Contents

- `mappers.ts` — Data transformation utilities for converting between DTOs, entities, and API formats
- `calculations.ts` — Financial and mathematical calculations for tokenization, ROI, and investment metrics
- `formatters.ts` — Data formatting utilities for currency, dates, percentages, and display values
- `validators.ts` — Pure validation functions and business rule helpers
- `transformers.ts` — Data transformation and normalization utilities
- `constants.ts` — Mathematical constants, conversion factors, and utility constants
- `index.ts` — Barrel file exporting all utility functions with organized namespaces

**Utility Responsibilities by File:**

#### `mappers.ts` (Data Mapping)
```typescript
// Entity to DTO conversion
export const projectToDTO = (entity: ProjectEntity): ProjectDTO;
export const projectToSummaryDTO = (entity: ProjectEntity): ProjectSummaryDTO;
export const dtoToEntity = (dto: CreateProjectInput): ProjectCreateData;

// Related entity mapping
export const clientToSummaryDTO = (client: ClientEntity): ClientSummaryDTO;
export const tokenToSummaryDTO = (token: TokenEntity): TokenSummaryDTO;

// Bulk mapping operations
export const mapProjectList = (entities: ProjectEntity[]): ProjectDTO[];
export const mapProjectSummaries = (entities: ProjectEntity[]): ProjectSummaryDTO[];
```

#### `calculations.ts` (Financial Mathematics)
```typescript
// Token economics
export const calculateTotalTokens = (totalPrice: number, tokenPrice: number): number;
export const calculateAvailableTokens = (total: number, percent: number): number;
export const calculateTokenValue = (tokens: number, price: number): number;

// Investment calculations
export const calculateROI = (initial: number, final: number, years: number): number;
export const calculateIRR = (cashFlows: number[], periods: number[]): number;
export const calculateNPV = (cashFlows: number[], rate: number): number;
export const calculateCAGR = (initial: number, final: number, years: number): number;
```

#### `formatters.ts` (Display Formatting)
```typescript
// Currency formatting
export const formatCurrency = (amount: number, currency?: string): string;
export const formatCompactCurrency = (amount: number): string; // e.g., "$1.2M"

// Percentage formatting
export const formatPercentage = (value: number, decimals?: number): string;
export const formatBasisPoints = (bps: number): string;

// Date formatting
export const formatDate = (date: Date, format?: string): string;
export const formatRelativeDate = (date: Date): string; // e.g., "2 days ago"

// Number formatting
export const formatLargeNumber = (num: number): string; // e.g., "1.2K", "1.2M"
export const formatDecimalPrecision = (num: number, precision: number): string;
```

#### `validators.ts` (Validation Helpers)
```typescript
// Business rule validation
export const validateTokenEconomics = (params: TokenEconomicsParams): ValidationResult;
export const validateInvestmentMetrics = (metrics: InvestmentMetrics): ValidationResult;
export const validateProjectLocation = (country: string, city: string): ValidationResult;

// Data integrity checks
export const validateFinancialConsistency = (project: ProjectData): ValidationResult;
export const validateDateRanges = (startDate: Date, endDate: Date): ValidationResult;
```

#### `transformers.ts` (Data Transformation)
```typescript
// Data type conversions
export const decimalToNumber = (decimal: Decimal): number;
export const numberToDecimal = (num: number): Decimal;
export const stringToDecimal = (str: string): Decimal;

// Data normalization
export const normalizeGeoData = (country: string, city: string): NormalizedGeoData;
export const normalizeTextInput = (text: string): string;
export const normalizeNumericInput = (input: string): number;

// Serialization helpers
export const serializeProject = (project: ProjectEntity): SerializedProject;
export const deserializeProject = (data: SerializedProject): ProjectEntity;
```

---

### 🎯 Code Style & Best Practices

#### Pure Function Design
```typescript
// Always pure - same input produces same output
export function calculateTokenValue(tokenCount: number, tokenPrice: number): number {
  // Validate inputs
  if (tokenCount < 0 || tokenPrice < 0) {
    throw new Error('Token count and price must be non-negative');
  }
  
  // Perform calculation
  const value = tokenCount * tokenPrice;
  
  // Return result (no side effects)
  return parseFloat(value.toFixed(2));
}

// Avoid side effects
export function formatCurrency(amount: number, currency = 'USD'): string {
  // Don't modify global state
  // Don't make external calls
  // Don't access databases
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}
```

#### Error Handling Patterns
```typescript
// Provide clear error messages for invalid inputs
export function calculateIRR(cashFlows: number[]): number {
  if (!Array.isArray(cashFlows)) {
    throw new Error('Cash flows must be an array');
  }
  
  if (cashFlows.length < 2) {
    throw new Error('IRR calculation requires at least 2 cash flows');
  }
  
  if (cashFlows.every(cf => cf <= 0)) {
    throw new Error('IRR calculation requires at least one positive cash flow');
  }
  
  // Perform calculation...
}

// Use custom error types for specific scenarios
export class CalculationError extends Error {
  constructor(message: string, public calculation: string, public inputs: any) {
    super(message);
    this.name = 'CalculationError';
  }
}

export function complexCalculation(inputs: CalculationInputs): number {
  try {
    // Perform calculation
  } catch (error) {
    throw new CalculationError(
      'Complex calculation failed',
      'complexCalculation',
      inputs
    );
  }
}
```

#### Type Safety and Documentation
```typescript
/**
 * Calculate return on investment (ROI) for a project
 * 
 * @param initialValue Initial investment amount
 * @param finalValue Final value after investment period
 * @param timeHorizonYears Investment time horizon in years
 * @returns ROI as percentage (e.g., 15.5 for 15.5%)
 * 
 * @example
 * ```typescript
 * const roi = calculateROI(100000, 150000, 3);
 * console.log(roi); // 16.67 (16.67% annualized ROI)
 * ```
 * 
 * @throws {Error} When any parameter is negative or zero
 * @throws {Error} When time horizon is not positive
 */
export function calculateROI(
  initialValue: number,
  finalValue: number,
  timeHorizonYears: number
): number {
  // Implementation with proper type checking
}

// Use branded types for type safety
export type Currency = number & { readonly brand: 'Currency' };
export type Percentage = number & { readonly brand: 'Percentage' };

export function formatCurrencyAmount(amount: Currency): string {
  return formatCurrency(amount);
}
```

#### Functional Programming Patterns
```typescript
// Use functional composition
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const formatProjectPrice = pipe(
  (price: number) => Math.round(price),
  (price: number) => formatCurrency(price),
  (formatted: string) => formatted.replace('.00', '')
);

// Use immutable data transformations
export function updateProjectMetrics(
  project: ProjectDTO,
  newMetrics: Partial<ProjectMetrics>
): ProjectDTO {
  return {
    ...project,
    metrics: {
      ...project.metrics,
      ...newMetrics
    }
  };
}

// Use higher-order functions for reusability
export const createValidator = <T>(
  validationFn: (value: T) => boolean,
  errorMessage: string
) => (value: T): T => {
  if (!validationFn(value)) {
    throw new Error(errorMessage);
  }
  return value;
};

export const validatePositiveNumber = createValidator(
  (num: number) => num > 0,
  'Number must be positive'
);
```

---

### 🧪 Testing & Documentation

#### Unit Testing Patterns
```typescript
describe('TokenCalculator', () => {
  describe('calculateTotalTokens', () => {
    it('should calculate correct total tokens', () => {
      const result = TokenCalculator.calculateTotalTokens(100000, 100);
      expect(result).toBe(1000);
    });

    it('should handle decimal token prices', () => {
      const result = TokenCalculator.calculateTotalTokens(100000, 99.99);
      expect(result).toBe(1000); // Floor result
    });

    it('should throw error for zero token price', () => {
      expect(() => {
        TokenCalculator.calculateTotalTokens(100000, 0);
      }).toThrow('Token price must be positive');
    });

    it('should throw error for negative token price', () => {
      expect(() => {
        TokenCalculator.calculateTotalTokens(100000, -100);
      }).toThrow('Token price must be positive');
    });
  });
});

// Property-based testing for mathematical functions
describe('FinancialCalculator', () => {
  describe('calculateCAGR', () => {
    // Test mathematical properties
    it('should return 0% for no growth', () => {
      const cagr = FinancialCalculator.calculateCAGR(100, 100, 5);
      expect(cagr).toBe(0);
    });

    it('should be commutative for reciprocal values', () => {
      const growth = FinancialCalculator.calculateCAGR(100, 200, 5);
      const decline = FinancialCalculator.calculateCAGR(200, 100, 5);
      expect(Math.abs(growth + decline)).toBeLessThan(0.01);
    });

    // Property: CAGR should compound correctly
    it('should compound correctly over time', () => {
      const initialValue = 100000;
      const years = 5;
      const expectedFinalValue = 150000;
      
      const cagr = FinancialCalculator.calculateCAGR(initialValue, expectedFinalValue, years);
      const calculatedFinalValue = initialValue * Math.pow(1 + cagr/100, years);
      
      expect(calculatedFinalValue).toBeCloseTo(expectedFinalValue, 0);
    });
  });
});
```

#### Performance Testing
```typescript
describe('Performance Tests', () => {
  it('should handle large datasets efficiently', () => {
    const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
      totalPrice: 100000 + i,
      tokenPrice: 100,
      tokensAvailablePercent: 80
    }));

    const startTime = performance.now();
    
    const results = largeDataset.map(data => 
      TokenCalculator.calculateTotalTokens(data.totalPrice, data.tokenPrice)
    );
    
    const endTime = performance.now();
    
    expect(endTime - startTime).toBeLessThan(100); // Should complete in under 100ms
    expect(results).toHaveLength(10000);
  });
});
```

---

### 🔒 Security & Data Protection

#### Input Sanitization
```typescript
// Sanitize numeric inputs
export function sanitizeNumericInput(input: unknown): number {
  if (typeof input === 'number') {
    if (!isFinite(input) || isNaN(input)) {
      throw new Error('Invalid numeric value');
    }
    return input;
  }
  
  if (typeof input === 'string') {
    const cleaned = input.replace(/[^0-9.-]/g, '');
    const parsed = parseFloat(cleaned);
    
    if (!isFinite(parsed) || isNaN(parsed)) {
      throw new Error('Invalid numeric string');
    }
    
    return parsed;
  }
  
  throw new Error('Input must be a number or numeric string');
}

// Prevent precision attacks in financial calculations
export function safeMathOperation(
  operation: 'add' | 'subtract' | 'multiply' | 'divide',
  a: number,
  b: number
): number {
  // Use decimal arithmetic to prevent floating point precision issues
  const decimalA = new Decimal(a);
  const decimalB = new Decimal(b);
  
  let result: Decimal;
  
  switch (operation) {
    case 'add':
      result = decimalA.plus(decimalB);
      break;
    case 'subtract':
      result = decimalA.minus(decimalB);
      break;
    case 'multiply':
      result = decimalA.mul(decimalB);
      break;
    case 'divide':
      if (decimalB.equals(0)) {
        throw new Error('Division by zero');
      }
      result = decimalA.div(decimalB);
      break;
  }
  
  return result.toNumber();
}
```

#### Data Validation
```typescript
// Validate financial data ranges
export function validateFinancialRange(
  value: number,
  min: number,
  max: number,
  fieldName: string
): number {
  if (value < min) {
    throw new Error(`${fieldName} cannot be less than ${min}`);
  }
  
  if (value > max) {
    throw new Error(`${fieldName} cannot be greater than ${max}`);
  }
  
  return value;
}

// Prevent malicious calculations
export function safeCalculatePercentage(
  part: number,
  whole: number
): number {
  validateFinancialRange(part, 0, Number.MAX_SAFE_INTEGER, 'part');
  validateFinancialRange(whole, 0.01, Number.MAX_SAFE_INTEGER, 'whole');
  
  if (part > whole) {
    throw new Error('Part cannot be greater than whole');
  }
  
  return (part / whole) * 100;
}
```

---

### 🚀 Performance Optimization

#### Memoization for Expensive Calculations
```typescript
// Memoize expensive IRR calculations
const irrCache = new Map<string, number>();

export function calculateIRRMemoized(cashFlows: number[]): number {
  const cacheKey = JSON.stringify(cashFlows);
  
  if (irrCache.has(cacheKey)) {
    return irrCache.get(cacheKey)!;
  }
  
  const result = calculateIRR(cashFlows);
  irrCache.set(cacheKey, result);
  
  return result;
}

// Clear cache when needed
export function clearCalculationCache(): void {
  irrCache.clear();
}
```

#### Efficient Data Transformations
```typescript
// Use efficient array operations
export function transformProjectList(projects: ProjectEntity[]): ProjectDTO[] {
  // Pre-allocate array for better performance
  const result = new Array<ProjectDTO>(projects.length);
  
  for (let i = 0; i < projects.length; i++) {
    result[i] = projectToDTO(projects[i]);
  }
  
  return result;
}

// Use lazy evaluation for expensive transformations
export function createLazyProjectTransformer(
  projects: ProjectEntity[]
): Generator<ProjectDTO> {
  return (function* () {
    for (const project of projects) {
      yield projectToDTO(project);
    }
  })();
}
```

---

### ⚙️ Intended Use Case

Designed for a **professional real estate tokenization platform** providing:

- **Financial Precision**: Accurate mathematical calculations for investment analysis and token economics
- **Data Transformation**: Reliable conversion between database entities, API DTOs, and display formats
- **Performance Optimization**: Efficient utilities supporting high-throughput financial operations
- **Type Safety**: Comprehensive type checking preventing calculation errors in financial contexts
- **Regulatory Compliance**: Proper handling of financial data with audit trails and precision controls
- **Reusability**: Pure functions that can be safely used across different contexts and components

This utils layer ensures **mathematical accuracy**, **data integrity**, and **performance efficiency** for a **production financial platform** handling **real estate investments** and **regulatory compliance** requirements.

---
