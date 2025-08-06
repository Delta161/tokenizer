---
applyTo: 'backend/src/modules/projects/services/, backend/src/modules/projects/services/*.service.ts'
---

### 📁 Folder: `backend/src/modules/projects/services/`

**Purpose:**  
This folder contains the business logic layer for project and property tokenization operations. Services encapsulate all complex business rules, database interactions, calculations, and third-party integrations related to real estate investment projects.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - SERVICES LAYER

Services are **Layer 5** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → Controller → 🎯 SERVICE → Utils → Types**

### ✅ Service Responsibilities (Layer 5)

Services handle all business logic for project operations and data persistence:

- **Execute business logic** including project validation rules, tokenization calculations, and investment mathematics
- **Manage database operations** using Prisma for Project, Property, Token, and related models
- **Implement data aggregation** for analytics, statistics, and reporting
- **Handle complex workflows** like project approval processes and status transitions
- **Coordinate cross-module operations** between projects, clients, investments, and blockchain services
- **Apply business rules enforcement** such as minimum investment amounts, token allocations, and project constraints
- **Manage data relationships** between projects, properties, tokens, clients, and investments

### ❌ What Services Should NOT Do

- **NO HTTP handling** - never access req/res objects or HTTP headers
- **NO route logic** - services are protocol-agnostic
- **NO authentication** - assume authenticated context is passed in
- **NO direct user input validation** - use validators layer (though services may apply business validation)
- **NO response formatting** - return raw business data, let controllers format
- **NO middleware functionality** - focus purely on business operations

### 🔄 Project Service Pattern Architecture

```typescript
export class ProjectService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
    private readonly tokenService: TokenService,
    private readonly blockchainService: BlockchainService
  ) {}

  async createProject(data: CreateProjectInput, clientId: string): Promise<ProjectDTO> {
    this.logger.info('Creating new project', { clientId, title: data.title });

    // 1. Business validation
    await this.validateProjectCreation(data, clientId);

    // 2. Calculate tokenization parameters
    const tokenMetrics = await this.calculateTokenMetrics(data);

    // 3. Database transaction for consistency
    const project = await this.prisma.$transaction(async (tx) => {
      // Create project record
      const project = await tx.project.create({
        data: {
          ...data,
          clientId,
          status: ProjectStatus.DRAFT,
          ...tokenMetrics
        }
      });

      // Initialize related records
      await this.initializeProjectRelations(tx, project.id);
      
      return project;
    });

    // 4. Post-creation processing
    await this.triggerProjectCreationWorkflow(project);

    this.logger.info('Project created successfully', { projectId: project.id });
    return this.mapToProjectDTO(project);
  }

  private async validateProjectCreation(data: CreateProjectInput, clientId: string): Promise<void> {
    // Business rule validation
    if (data.totalPrice < MINIMUM_PROJECT_VALUE) {
      throw new ProjectValidationError('Project value below minimum threshold');
    }

    // Client validation
    const client = await this.validateClientAccess(clientId);
    
    // Market validation
    await this.validateMarketRequirements(data.country, data.city);
  }
}
```

### ✅ Architecture Compliance Rules

1. **Database Authority**: Services are the ONLY layer that can interact with Prisma and database
2. **Business Logic Ownership**: ALL project calculations, validations, and workflows must be in services
3. **Transaction Management**: Use Prisma transactions for multi-step operations to ensure data consistency
4. **Error Handling**: Throw business-specific errors (ProjectError, ProjectNotFoundError, etc.)
5. **Dependency Injection**: Accept all dependencies through constructor for testability
6. **Logging Integration**: Log all significant business operations for audit and debugging
7. **Type Safety**: Use strong typing with DTOs for inputs/outputs and domain models for internal logic

### 📊 Project-Specific Service Patterns

#### Core Business Operations
```typescript
// Project Lifecycle Management
async createProject(data: CreateProjectInput, clientId: string): Promise<ProjectDTO>
async updateProject(id: string, clientId: string, data: UpdateProjectInput): Promise<ProjectDTO>
async deleteProject(id: string, clientId: string): Promise<void>
async updateProjectStatus(id: string, status: ProjectStatus, reason?: string): Promise<ProjectDTO>

// Query Operations with Business Logic
async getProjects(options: ProjectQueryOptions): Promise<PaginatedResult<ProjectDTO>>
async getProjectById(id: string, includeRelations?: boolean): Promise<ProjectDTO>
async getProjectsByClient(clientId: string, options: ProjectQueryOptions): Promise<ProjectDTO[]>
async getFeaturedProjects(limit?: number): Promise<ProjectDTO[]>

// Advanced Business Operations
async searchProjects(searchTerm: string, options: SearchOptions): Promise<ProjectSearchResult>
async getProjectStatistics(clientId?: string): Promise<ProjectStatistics>
async calculateProjectMetrics(projectId: string): Promise<ProjectMetrics>
async validateProjectInvestment(projectId: string, amount: number): Promise<ValidationResult>
```

#### Tokenization Service Patterns
```typescript
// Token Economics and Calculations
async calculateTokenMetrics(projectData: CreateProjectInput): Promise<TokenMetrics>
async updateTokenAllocation(projectId: string, allocation: TokenAllocation): Promise<void>
async processTokenTransaction(projectId: string, transaction: TokenTransaction): Promise<TransactionResult>
async calculateROIProjections(projectId: string): Promise<ROIProjection>

// Blockchain Integration
async initializeProjectTokens(projectId: string): Promise<TokenDeployment>
async syncBlockchainState(projectId: string): Promise<BlockchainSyncResult>
async processTokenDistribution(projectId: string, investors: InvestorAllocation[]): Promise<DistributionResult>
```

#### Data Aggregation and Analytics
```typescript
// Business Intelligence
async aggregateProjectPerformance(timeRange: DateRange): Promise<PerformanceMetrics>
async calculateMarketAnalytics(country?: string, city?: string): Promise<MarketAnalytics>
async generateProjectReports(projectIds: string[], format: ReportFormat): Promise<ProjectReport>
async trackProjectMetrics(projectId: string): Promise<ProjectTracking>
```

---

### 📂 Folder Contents

- `project.service.ts` — Core project business logic, CRUD operations, lifecycle management
- `property.service.ts` — Property-specific operations, valuations, market analysis
- `token.service.ts` — Tokenization logic, blockchain integration, token economics
- `analytics.service.ts` — Data aggregation, reporting, business intelligence
- `index.ts` — Barrel file exporting all service modules with dependency injection setup

**Service Responsibilities by File:**

#### `project.service.ts` (Primary Business Logic)
- **Project CRUD Operations**: Creation, updates, deletion with business rules
- **Lifecycle Management**: Status transitions, approval workflows, completion processes
- **Access Control**: Client ownership validation, admin privileges
- **Business Validation**: Investment minimums, token allocations, market requirements
- **Data Aggregation**: Project statistics, performance metrics, client summaries

#### `property.service.ts` (Real Estate Domain Logic)
- **Property Valuations**: Market analysis, price calculations, appreciation projections
- **Location Intelligence**: Geographic data, market conditions, regulatory compliance
- **Property Metadata**: Images, documents, legal information management
- **Market Analysis**: Comparable properties, market trends, investment attractiveness

#### `token.service.ts` (Tokenization & Blockchain)
- **Token Economics**: Price calculations, supply distribution, dividend calculations
- **Blockchain Integration**: Smart contract interactions, token deployment, transaction processing
- **Investment Processing**: Token purchases, redemptions, transfers
- **Yield Calculations**: APR, IRR, value growth projections based on tokenization model

#### `analytics.service.ts` (Business Intelligence)
- **Performance Tracking**: Project ROI, client portfolio performance, market analytics
- **Reporting Systems**: Dashboard data, export functionality, scheduled reports
- **Predictive Analytics**: Investment forecasting, risk assessment, market predictions
- **Compliance Reporting**: Regulatory reports, audit trails, transaction monitoring

---

### 🎯 Code Style & Best Practices

#### Service Class Structure
```typescript
export class ProjectService {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter,
    private readonly configService: ConfigService
  ) {}

  // Public business methods
  async createProject(...): Promise<ProjectDTO> { }
  
  // Private helper methods
  private async validateBusinessRules(...): Promise<void> { }
  private async calculateMetrics(...): Promise<Metrics> { }
  private mapToDTO(entity: Project): ProjectDTO { }
}
```

#### Error Handling Patterns
```typescript
// Use domain-specific errors
throw new ProjectNotFoundError(`Project ${id} not found`);
throw new ProjectAccessError('Client does not own this project');
throw new ProjectValidationError('Invalid token allocation parameters');

// Validate business preconditions
if (project.status === ProjectStatus.COMPLETED) {
  throw new ProjectStateError('Cannot modify completed project');
}
```

#### Database Transaction Patterns
```typescript
// Use transactions for complex multi-step operations
const result = await this.prisma.$transaction(async (tx) => {
  const project = await tx.project.update({ ... });
  await tx.projectHistory.create({ ... });
  await tx.notification.create({ ... });
  return project;
});
```

#### Dependency Injection & Testing
```typescript
// Constructor injection for testability
constructor(
  private readonly prisma: PrismaClient,
  private readonly tokenService: TokenService,
  private readonly logger: Logger = new Logger('ProjectService')
) {}
```

---

### 🧪 Testing & Documentation

#### Unit Testing Requirements
```typescript
describe('ProjectService', () => {
  let service: ProjectService;
  let mockPrisma: jest.Mocked<PrismaClient>;
  let mockTokenService: jest.Mocked<TokenService>;

  beforeEach(() => {
    mockPrisma = createMockPrisma();
    mockTokenService = createMockTokenService();
    service = new ProjectService(mockPrisma, mockTokenService);
  });

  // Test business logic
  it('should calculate correct token metrics for project');
  it('should validate minimum investment requirements');
  it('should enforce client ownership rules');
  
  // Test error scenarios
  it('should throw ProjectNotFoundError for invalid project ID');
  it('should throw ProjectAccessError for unauthorized access');
  
  // Test database operations
  it('should create project with proper database relationships');
  it('should use transactions for complex operations');
});
```

#### Documentation Standards
- **Business Logic Documentation**: Explain WHY decisions are made, not just HOW
- **Mathematical Formulas**: Document all tokenization and ROI calculations
- **Workflow Diagrams**: Document complex multi-step business processes
- **API Contracts**: Document input/output types and business constraints

---

### 🔒 Security & Data Protection

#### Business Rule Enforcement
```typescript
// Validate ownership before operations
private async validateProjectOwnership(projectId: string, clientId: string): Promise<void> {
  const project = await this.prisma.project.findFirst({
    where: { id: projectId, clientId }
  });
  
  if (!project) {
    throw new ProjectAccessError('Project not found or access denied');
  }
}

// Sanitize sensitive data
private sanitizeProjectData(project: Project, context: RequestContext): ProjectDTO {
  const dto = this.mapToProjectDTO(project);
  
  if (context.userRole !== 'ADMIN') {
    delete dto.internalNotes;
    delete dto.moderationHistory;
  }
  
  return dto;
}
```

#### Data Validation & Integrity
- **Business Validation**: Enforce minimum values, maximum limits, valid ranges
- **Referential Integrity**: Ensure proper relationships between projects, clients, tokens
- **State Consistency**: Validate state transitions and business workflows
- **Audit Trails**: Log all significant business operations for compliance

---

### 🚀 Performance & Optimization

#### Database Query Optimization
```typescript
// Use selective field loading
async getProjectSummary(id: string): Promise<ProjectSummaryDTO> {
  const project = await this.prisma.project.findUnique({
    where: { id },
    select: {
      id: true,
      title: true,
      status: true,
      totalPrice: true,
      tokenPrice: true,
      // Exclude heavy fields like descriptions, images
    }
  });
  
  return this.mapToSummaryDTO(project);
}

// Implement pagination for large datasets
async getProjects(options: ProjectQueryOptions): Promise<PaginatedResult<ProjectDTO>> {
  const { page = 1, limit = 10, filters } = options;
  
  const [projects, total] = await Promise.all([
    this.prisma.project.findMany({
      where: this.buildWhereClause(filters),
      skip: (page - 1) * limit,
      take: limit,
      orderBy: this.buildOrderClause(options.sortBy)
    }),
    this.prisma.project.count({
      where: this.buildWhereClause(filters)
    })
  ]);

  return {
    data: projects.map(p => this.mapToProjectDTO(p)),
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
  };
}
```

#### Caching Strategies
```typescript
// Cache expensive calculations
@Cache(60000) // Cache for 1 minute
async calculateMarketAnalytics(country: string, city: string): Promise<MarketAnalytics> {
  // Expensive market data calculations
}

// Use database views for complex aggregations
async getProjectStatistics(): Promise<ProjectStatistics> {
  // Use database views or materialized queries for better performance
  const stats = await this.prisma.$queryRaw`
    SELECT status, COUNT(*) as count, AVG(total_price) as avg_price
    FROM project_statistics_view
    GROUP BY status
  `;
  
  return this.mapToStatistics(stats);
}
```

---

### ⚙️ Intended Use Case

Designed for a **professional real estate tokenization platform** supporting:

- **Multi-Client Architecture**: Each client can manage their portfolio of tokenized properties
- **Investment Marketplace**: Investors can discover and invest in tokenized real estate projects
- **Regulatory Compliance**: Full audit trails, reporting, and compliance with financial regulations
- **Blockchain Integration**: Smart contract deployment, token management, automated distributions
- **Advanced Analytics**: ROI calculations, market analysis, portfolio performance tracking
- **Scalable Operations**: Support for high-volume projects and complex investment structures

This service layer provides **enterprise-grade business logic** with comprehensive **data validation**, **transaction safety**, **performance optimization**, and **security controls** for a production-ready investment platform.

---
