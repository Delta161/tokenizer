---
applyTo: 'backend/src/modules/projects/routes/, backend/src/modules/projects/routes/*.routes.ts'
---

### 📁 Folder: `backend/src/modules/projects/routes/`

**Purpose:**  
This folder contains Express.js route definitions that map HTTP endpoints to controller functions for the projects module. Routes handle URL mapping, middleware application, and request routing for the real estate tokenization platform.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - ROUTES LAYER

Routes are **Layer 1** in the mandatory 7-layer backend architecture:

**🎯 ROUTE → Middleware → Validator → Controller → Service → Utils → Types**

### ✅ Routes Responsibilities (Layer 1)

Routes handle HTTP endpoint mapping and middleware orchestration:

- **URL Pattern Mapping**: Define RESTful endpoints and URL parameters for project operations
- **HTTP Method Assignment**: Map appropriate HTTP verbs (GET, POST, PUT, PATCH, DELETE) to operations
- **Middleware Chain Management**: Apply authentication, authorization, validation, and logging middleware
- **Request Routing**: Direct incoming requests to appropriate controller functions
- **Route Organization**: Group related endpoints and maintain clean URL hierarchies
- **Error Boundary Setup**: Ensure proper error handling middleware is applied
- **Documentation Integration**: Provide route-level documentation for API consumers

### ❌ What Routes Should NOT Do

- **NO business logic** - routes only handle routing and middleware, never business operations
- **NO data processing** - delegate all data handling to controllers and services
- **NO direct database access** - routes never interact with Prisma or databases
- **NO validation logic** - use middleware or dedicated validator functions
- **NO authentication implementation** - apply authentication middleware, don't implement it
- **NO response formatting** - controllers handle response structure

### 🔄 Project Routes Architecture Pattern

```typescript
import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { requireAuth } from '../../accounts/middleware/session.middleware';
import { requireRole } from '../../accounts/middleware/user.middleware';

const router = Router();

// Apply global middleware - authentication required for all routes
router.use(requireAuth);

/**
 * Core CRUD Operations
 * RESTful endpoint design following industry standards
 */

// Create new project - POST /api/v1/projects
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), // Authorization middleware
  projectController.createProject    // Controller function
);

// Get projects with filtering - GET /api/v1/projects
router.get('/', 
  projectController.getProjects
);

// Get specific project - GET /api/v1/projects/:id
router.get('/:id', 
  projectController.getProjectById
);

// Update project - PUT /api/v1/projects/:id
router.put('/:id', 
  projectController.updateProject
);

// Delete project - DELETE /api/v1/projects/:id
router.delete('/:id', 
  projectController.deleteProject
);

/**
 * Advanced Operations
 * Non-CRUD endpoints for specialized functionality
 */

// Update project status - PATCH /api/v1/projects/:id/status
router.patch('/:id/status', 
  requireRole(['ADMIN']), // Admin-only operation
  projectController.updateProjectStatus
);

// Get project statistics - GET /api/v1/projects/stats
router.get('/stats', 
  requireRole(['ADMIN']), 
  projectController.getProjectStats
);

// Get featured projects - GET /api/v1/projects/featured
router.get('/featured', 
  projectController.getFeaturedProjects
);

// Search projects - GET /api/v1/projects/search
router.get('/search', 
  projectController.searchProjects
);

export { router as projectRoutes };
```

### ✅ Architecture Compliance Rules

1. **Middleware First**: Always apply necessary middleware before controller functions
2. **Single Responsibility**: Each route maps exactly one endpoint to one controller function
3. **RESTful Design**: Follow REST conventions for URL patterns and HTTP methods
4. **No Business Logic**: Routes only handle routing - no calculations, validations, or data processing
5. **Authentication Chain**: Apply authentication and authorization middleware consistently
6. **Error Handling**: Ensure error handling middleware is properly configured in the chain
7. **Type Safety**: Use TypeScript for route definitions and middleware typing

### 📊 Project-Specific Route Patterns

#### RESTful CRUD Patterns
```typescript
/**
 * Standard REST endpoint mapping for projects
 */
// GET /api/v1/projects - List projects (with filtering, pagination)
router.get('/', projectController.getProjects);

// GET /api/v1/projects/:id - Get single project
router.get('/:id', projectController.getProjectById);

// POST /api/v1/projects - Create new project
router.post('/', requireRole(['CLIENT', 'ADMIN']), projectController.createProject);

// PUT /api/v1/projects/:id - Update entire project
router.put('/:id', projectController.updateProject);

// PATCH /api/v1/projects/:id - Partial project update
router.patch('/:id', projectController.updateProject);

// DELETE /api/v1/projects/:id - Delete project
router.delete('/:id', projectController.deleteProject);
```

#### Specialized Endpoint Patterns
```typescript
/**
 * Non-CRUD endpoints for specialized operations
 */
// Status management - PATCH /projects/:id/status
router.patch('/:id/status', 
  requireRole(['ADMIN']), 
  projectController.updateProjectStatus
);

// Analytics endpoints - GET /projects/stats
router.get('/stats', 
  requireRole(['ADMIN']), 
  projectController.getProjectStats
);

// Discovery endpoints - GET /projects/featured
router.get('/featured', 
  projectController.getFeaturedProjects
);

// Search endpoints - GET /projects/search
router.get('/search', 
  projectController.searchProjects
);

// Bulk operations - POST /projects/bulk
router.post('/bulk', 
  requireRole(['ADMIN']), 
  projectController.bulkOperations
);
```

#### Middleware Chain Patterns
```typescript
/**
 * Complex middleware chains for different endpoint types
 */

// Public endpoints (minimal middleware)
router.get('/featured', 
  projectController.getFeaturedProjects
);

// Client endpoints (authentication + role check)
router.post('/', 
  requireAuth,                    // Session authentication
  requireRole(['CLIENT', 'ADMIN']), // Role-based authorization
  projectController.createProject
);

// Admin endpoints (authentication + admin role + logging)
router.get('/stats', 
  requireAuth,
  requireRole(['ADMIN']),
  auditLogger('project_stats_accessed'), // Audit logging
  projectController.getProjectStats
);

// High-security endpoints (additional validation)
router.patch('/:id/status', 
  requireAuth,
  requireRole(['ADMIN']),
  validateProjectOwnership,       // Custom validation middleware
  auditLogger('project_status_changed'),
  projectController.updateProjectStatus
);
```

---

### 📂 Folder Contents

- `project.routes.ts` — Main project endpoints for CRUD operations, status management, analytics
- `index.ts` — Barrel file combining all route modules and exporting configured router
- `projects.routes.ts` — Legacy route file (maintain for backward compatibility if needed)

**Route Responsibilities by File:**

#### `project.routes.ts` (Primary Route Configuration)
```typescript
// Core CRUD operations
POST   /                    - Create new project
GET    /                    - List projects with filtering/pagination
GET    /:id                 - Get specific project details
PUT    /:id                 - Update entire project
DELETE /:id                 - Delete project

// Status management
PATCH  /:id/status          - Update project status (admin only)

// Analytics and reporting
GET    /stats               - Project statistics (admin only)

// Discovery features
GET    /featured            - Featured projects for homepage
GET    /search              - Search projects with full-text search

// Bulk operations
POST   /bulk                - Bulk project operations (admin only)
```

#### `index.ts` (Route Module Integration)
```typescript
import { Router } from 'express';
import { projectRoutes } from './project.routes';

const router = Router();

// Mount project routes at base path
router.use('/', projectRoutes);

// Export combined router for application mounting
export { router as projectModuleRoutes };
```

---

### 🎯 Code Style & Best Practices

#### Route Organization Patterns
```typescript
// Group related routes together
const router = Router();

/**
 * =============================================================================
 * AUTHENTICATION SETUP
 * =============================================================================
 */
router.use(requireAuth); // Global authentication

/**
 * =============================================================================
 * PUBLIC READ OPERATIONS
 * =============================================================================
 */
router.get('/', projectController.getProjects);
router.get('/featured', projectController.getFeaturedProjects);
router.get('/search', projectController.searchProjects);
router.get('/:id', projectController.getProjectById);

/**
 * =============================================================================
 * CLIENT OPERATIONS (CREATE, UPDATE, DELETE)
 * =============================================================================
 */
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), 
  projectController.createProject
);

router.put('/:id', 
  projectController.updateProject
);

router.delete('/:id', 
  projectController.deleteProject
);

/**
 * =============================================================================
 * ADMIN OPERATIONS (MANAGEMENT, ANALYTICS)
 * =============================================================================
 */
router.patch('/:id/status', 
  requireRole(['ADMIN']), 
  projectController.updateProjectStatus
);

router.get('/stats', 
  requireRole(['ADMIN']), 
  projectController.getProjectStats
);
```

#### Middleware Application Patterns
```typescript
// Apply middleware at different levels
const router = Router();

// Global middleware for all routes
router.use(requireAuth);
router.use(requestLogger);

// Route-specific middleware
router.post('/', 
  requireRole(['CLIENT']),        // Authorization
  validateRequest('createProject'), // Validation
  rateLimit({ max: 10 }),        // Rate limiting
  projectController.createProject
);

// Conditional middleware
router.get('/:id', 
  (req, res, next) => {
    // Apply different middleware based on conditions
    if (req.query.detailed === 'true') {
      return requireRole(['ADMIN'])(req, res, next);
    }
    next();
  },
  projectController.getProjectById
);
```

#### Error Handling Integration
```typescript
// Ensure error handling middleware is properly applied
const router = Router();

// Route definitions...

// Error handling middleware (applied after all routes)
router.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  // Route-specific error handling
  if (error.name === 'ProjectNotFoundError') {
    return res.status(404).json({
      success: false,
      error: 'Project not found',
      code: 'PROJECT_NOT_FOUND'
    });
  }
  
  // Forward to global error handler
  next(error);
});

export { router as projectRoutes };
```

#### Documentation and Comments
```typescript
/**
 * Project Management Routes
 * 
 * Handles all HTTP endpoints for project operations in the real estate
 * tokenization platform. Includes CRUD operations, status management,
 * analytics, and discovery features.
 * 
 * @route_prefix /api/v1/projects
 * @authentication Required (session-based)
 * @authorization Role-based (CLIENT, ADMIN)
 */

/**
 * Create new tokenized real estate project
 * 
 * @route POST /api/v1/projects
 * @access CLIENT, ADMIN
 * @body {CreateProjectInput} Project data including location, pricing, tokenization parameters
 * @returns {ProjectDTO} Created project with generated ID and metadata
 * @throws {400} Validation error for invalid project data
 * @throws {403} Insufficient permissions (requires CLIENT role)
 */
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), 
  projectController.createProject
);

/**
 * List projects with filtering and pagination
 * 
 * @route GET /api/v1/projects
 * @access Authenticated users
 * @query {ProjectQueryParams} Optional filters, pagination, and sorting
 * @returns {PaginatedResult<ProjectDTO>} List of projects matching criteria
 * @scope Client users see only their projects, admins see all projects
 */
router.get('/', 
  projectController.getProjects
);
```

---

### 🧪 Testing & Documentation

#### Route Testing Patterns
```typescript
describe('Project Routes', () => {
  let app: Express;
  let authToken: string;

  beforeEach(async () => {
    app = createTestApp();
    authToken = await getAuthToken('CLIENT');
  });

  describe('POST /api/v1/projects', () => {
    it('should create project with valid data', async () => {
      const projectData = {
        title: 'Test Project',
        description: 'A valid test project',
        country: 'US',
        totalPrice: 1000000
      };

      const response = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${authToken}`)
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
    });

    it('should require authentication', async () => {
      await request(app)
        .post('/api/v1/projects')
        .send({})
        .expect(401);
    });

    it('should require CLIENT role', async () => {
      const investorToken = await getAuthToken('INVESTOR');
      
      await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${investorToken}`)
        .send({})
        .expect(403);
    });
  });

  describe('GET /api/v1/projects', () => {
    it('should return paginated project list', async () => {
      const response = await request(app)
        .get('/api/v1/projects?page=1&limit=10')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });
});
```

#### API Documentation Generation
```typescript
/**
 * @swagger
 * /api/v1/projects:
 *   post:
 *     summary: Create new tokenized real estate project
 *     tags: [Projects]
 *     security:
 *       - sessionAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateProjectInput'
 *     responses:
 *       201:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ProjectDTO'
 *       400:
 *         description: Validation error
 *       403:
 *         description: Insufficient permissions
 */
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), 
  projectController.createProject
);
```

---

### 🔒 Security & Access Control

#### Authentication Patterns
```typescript
// Global authentication for all routes
router.use(requireAuth);

// Route-specific authentication bypass (if needed)
router.get('/public-info', 
  // Skip authentication for public endpoints
  projectController.getPublicProjectInfo
);

// Enhanced authentication for sensitive operations
router.delete('/:id', 
  requireAuth,
  requireMFA, // Multi-factor authentication for deletions
  projectController.deleteProject
);
```

#### Authorization Patterns
```typescript
// Role-based authorization
router.post('/', 
  requireRole(['CLIENT', 'ADMIN']), 
  projectController.createProject
);

// Multi-role authorization
router.get('/analytics', 
  requireAnyRole(['ADMIN', 'ANALYST']), 
  projectController.getAnalytics
);

// Resource-based authorization
router.put('/:id', 
  requireProjectOwnership, // Custom middleware checking project ownership
  projectController.updateProject
);

// Conditional authorization
router.get('/:id', 
  conditionalAuth((req) => {
    // More restrictive auth for detailed views
    return req.query.detailed === 'true' ? ['ADMIN'] : ['CLIENT', 'ADMIN'];
  }),
  projectController.getProjectById
);
```

#### Security Middleware Integration
```typescript
// Apply security middleware in correct order
router.use('/admin', 
  requireAuth,                // 1. Authentication first
  requireRole(['ADMIN']),     // 2. Authorization second
  auditLogger,               // 3. Logging third
  rateLimit({ max: 100 }),   // 4. Rate limiting fourth
  adminRoutes                // 5. Route handling last
);

// Input validation middleware
router.post('/', 
  requireAuth,
  validateInput(CreateProjectSchema), // Validate before processing
  sanitizeInput,                     // Sanitize after validation
  projectController.createProject
);
```

---

### 🚀 Performance & Optimization

#### Route Performance Patterns
```typescript
// Use route-specific caching
router.get('/featured', 
  cacheResponse({ ttl: 300 }), // Cache for 5 minutes
  projectController.getFeaturedProjects
);

// Apply compression for large responses
router.get('/', 
  compression({ level: 6 }), // Compress project lists
  projectController.getProjects
);

// Use route-specific rate limiting
router.post('/', 
  rateLimit({ 
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 project creations per window
    message: 'Too many project creations, try again later'
  }),
  projectController.createProject
);
```

#### Route Optimization
```typescript
// Optimize route ordering (most specific first)
router.get('/featured', projectController.getFeaturedProjects); // Before /:id
router.get('/search', projectController.searchProjects);       // Before /:id
router.get('/stats', requireRole(['ADMIN']), projectController.getStats); // Before /:id
router.get('/:id', projectController.getProjectById);         // Generic param route last

// Use route prefixes for organization
const adminRouter = Router();
adminRouter.use(requireRole(['ADMIN'])); // Apply admin auth once
adminRouter.get('/stats', projectController.getStats);
adminRouter.get('/reports', projectController.getReports);
router.use('/admin', adminRouter); // Mount admin routes

// Conditional route loading
if (process.env.NODE_ENV === 'development') {
  router.get('/debug', projectController.getDebugInfo);
}
```

---

### ⚙️ Intended Use Case

Designed for a **professional real estate tokenization platform** supporting:

- **Multi-Tenant Architecture**: Client-specific project management with proper isolation
- **Role-Based Access Control**: Different permissions for investors, clients, and administrators
- **RESTful API Design**: Industry-standard endpoints for web and mobile applications  
- **Enterprise Security**: Session-based authentication with comprehensive authorization
- **High Performance**: Optimized routing with caching, compression, and rate limiting
- **Regulatory Compliance**: Audit logging and access controls for financial regulations
- **Scalable Operations**: Route organization supporting platform growth and feature expansion

This routes layer provides **clean API design**, **robust security**, and **optimal performance** for a **production financial platform** serving **real estate investment operations** with **regulatory compliance** requirements.

---
