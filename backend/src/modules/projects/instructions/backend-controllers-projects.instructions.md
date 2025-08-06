---
applyTo: 'backend/src/modules/projects/controllers/, backend/src/modules/projects/controllers/*.controller.ts'
---

### 📁 Folder: `backend/src/modules/projects/controllers/`

**Purpose:**  
This folder contains Express.js controller modules responsible for handling HTTP requests related to project and property tokenization management. Controllers act as the interface layer between incoming API calls and the business logic encapsulated in the services layer for real estate investment projects.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - CONTROLLERS LAYER

Controllers are **Layer 3** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → 🎯 CONTROLLER → Service → Utils → Types**

### ✅ Controller Responsibilities (Layer 3)

Controllers handle incoming HTTP requests for project operations and prepare HTTP responses:

- **Extract project data** from request (params, query, body) including project IDs, filtering criteria, and project metadata
- **Validate request data** using Zod schemas from the validators layer
- **Call appropriate project service functions** to perform business logic operations
- **Format and return responses** with proper HTTP status codes and project data structures
- **Handle errors** by forwarding to error handling middleware with project-specific error codes
- **Apply authentication context** ensuring project ownership and role-based access control

### ❌ What Controllers Should NOT Do

- **NO business logic** - delegate all project calculations and validations to services
- **NO database calls** - services handle all Prisma interactions with Project, Property, Token models
- **NO complex data processing** - use services and utils for project calculations, tokenization logic
- **NO authentication logic** - use middleware for session and role validation
- **NO direct Prisma usage** - only services can interact with project-related database models
- **NO blockchain operations** - delegate token creation and management to services
- **NO file processing** - delegate document handling and image processing to services

### 🔄 Project Controller Flow Pattern

```typescript
export const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    // 1. Extract and validate request data
    const validation = CreateProjectSchema.safeParse(req.body);
    if (!validation.success) {
      return next(createError(400, 'Invalid project data', { 
        details: validation.error.issues 
      }));
    }

    // 2. Apply business context (client ownership, permissions)
    const clientId = req.user?.clientId || req.user?.id;
    if (!clientId) {
      return next(createError(403, 'Client access required'));
    }

    // 3. Delegate to service layer
    const project = await projectService.createProject(validation.data, clientId);

    // 4. Return structured response
    res.status(201).json({
      success: true,
      data: project,
      message: 'Project created successfully'
    });
  } catch (error) {
    next(error); // Forward to centralized error handling
  }
};
```

### ✅ Architecture Compliance Rules

1. **Services Only**: All project business logic, tokenization calculations, and property management must be in services layer
2. **No Prisma**: Controllers cannot directly use Prisma client for Project, Property, Token, or Client models
3. **Error Forwarding**: Use `next(error)` with createError() for centralized project error handling
4. **Single Responsibility**: Each controller function handles one specific project operation endpoint
5. **Type Safety**: Use TypeScript with AuthenticatedRequest interface and proper project type definitions
6. **Validation Integration**: Always use Zod validators from the validators layer before processing requests
7. **Role-Based Access**: Respect CLIENT/ADMIN role distinctions for project operations

### 📊 Project-Specific Controller Patterns

#### CRUD Operations Pattern
```typescript
// CREATE: Always validate + check client ownership
const createProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Validation → Service → Response
};

// READ: Apply filtering + pagination + client scope
const getProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Query validation → Service with filters → Paginated response
};

// UPDATE: Ownership check + validation + service call
const updateProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Params + Body validation → Ownership check → Service → Response
};

// DELETE: Ownership check + cascade considerations
const deleteProject = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Params validation → Ownership check → Service with cascade → Response
};
```

#### Advanced Operations Pattern
```typescript
// STATUS MANAGEMENT: Admin-only operations
const updateProjectStatus = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Admin role check → Status validation → Service → Notification triggers
};

// ANALYTICS: Performance and statistics
const getProjectStats = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Role check → Service aggregation → Formatted metrics
};

// SEARCH: Full-text search with filters
const searchProjects = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  // Search validation → Service with search logic → Relevance-sorted results
};
```

---

### 📂 Folder Contents

- `project.controller.ts` — Main project operations: CRUD, status management, analytics, search functionality
- `index.ts` — Barrel file exporting all project controller modules

**Controller Responsibilities by File:**

#### `project.controller.ts`
- **Core CRUD**: Create, read, update, delete projects
- **Advanced Queries**: Filtering, pagination, sorting with multiple criteria
- **Status Management**: Project lifecycle workflow (DRAFT → PENDING → ACTIVE → COMPLETED)
- **Analytics Operations**: Statistics, metrics, performance data for admin dashboards
- **Discovery Features**: Featured projects, search functionality
- **Client Operations**: Client-scoped project management and ownership validation

---

### 🎯 Code Style & Best Practices

#### Express.js Patterns
- Use **Express 5 async route handlers** with `async/await` for all project operations
- Use **TypeScript** with `AuthenticatedRequest` interface for user context
- Use **named exports** for all project handler functions
- Implement **comprehensive error handling** with project-specific error messages

#### Request/Response Patterns
```typescript
// Standard success response structure
res.status(200).json({
  success: true,
  data: projectData,
  message: 'Operation completed successfully'
});

// Paginated response structure
res.status(200).json({
  success: true,
  data: projects,
  pagination: {
    page: 1,
    limit: 10,
    total: 100,
    totalPages: 10
  }
});

// Error handling with context
return next(createError(400, 'Invalid project data', {
  code: 'PROJECT_VALIDATION_ERROR',
  details: validation.error.issues
}));
```

#### Authentication & Authorization
- Always use `AuthenticatedRequest` interface for user context
- Implement **client ownership checks** for project operations
- Respect **role-based access control** (CLIENT vs ADMIN permissions)
- Apply **proper scoping** (clients see only their projects, admins see all)

#### Validation Integration
- **Always validate** using Zod schemas from validators layer before service calls
- **Handle validation errors** with detailed error messages and field-specific feedback
- **Sanitize inputs** through validation schemas to prevent injection attacks

---

### 🧪 Testing & Documentation

#### Unit Testing Requirements
```typescript
describe('ProjectController', () => {
  // Test authentication requirements
  it('should require authenticated user for project creation');
  
  // Test validation integration
  it('should validate project data using Zod schemas');
  
  // Test role-based access
  it('should restrict admin operations to admin users');
  
  // Test ownership checks
  it('should prevent clients from accessing other clients\' projects');
  
  // Test service integration
  it('should delegate business logic to project service');
  
  // Test error handling
  it('should handle service errors and forward to error middleware');
});
```

#### Documentation Standards
- Use **JSDoc comments** for all controller functions with parameter descriptions
- Document **authentication requirements** and role restrictions
- Include **example request/response** formats in comments
- Document **error scenarios** and expected HTTP status codes

---

### 🔒 Security & Access Control

#### Authentication Requirements
- **All endpoints require authentication** via session middleware
- **Client operations** require CLIENT or ADMIN role
- **Admin operations** (status changes, analytics) require ADMIN role only
- **Ownership validation** for project access and modifications

#### Data Protection
```typescript
// Sanitize sensitive data in responses
const sanitizeProjectForClient = (project: Project, userRole: UserRole) => {
  if (userRole === 'CLIENT') {
    // Remove admin-only fields
    delete project.moderationNotes;
    delete project.internalStatus;
  }
  return project;
};
```

#### Input Validation Security
- **Never trust client input** - always validate with Zod schemas
- **Sanitize all inputs** to prevent XSS and injection attacks
- **Validate file uploads** and limit file types for project documents
- **Rate limit** project creation and modification operations

---

### 🚀 Performance Considerations

#### Efficient Data Loading
- Use **pagination** for all list operations to prevent large data loads
- Implement **selective field loading** based on user context
- Apply **database indexes** through service layer for common query patterns
- Use **caching strategies** for frequently accessed project data

#### Response Optimization
- **Minimize response payloads** by excluding unnecessary fields
- **Use compression** for large project datasets
- **Implement ETags** for project resource caching
- **Optimize query patterns** through proper service layer design

---

### ⚙️ Intended Use Case

Designed for a **real estate tokenization platform** where:
- **Clients** can create and manage property investment projects
- **Investors** can browse and discover investment opportunities
- **Administrators** can moderate and approve projects
- **Projects** represent tokenized real estate with comprehensive metadata
- **Token economics** drive investment and returns calculations

This controller layer supports **multi-tenant architecture** with proper client isolation, **role-based access control**, and **comprehensive project lifecycle management** for a professional-grade investment platform.

---
