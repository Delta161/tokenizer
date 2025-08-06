# Projects Module Instructions Overview

This document provides an overview of all instruction files created for the backend projects module, following the standardized naming convention and comprehensive coverage of each architectural layer.

## 📁 Instruction Files Structure

The following instruction files have been created for the Projects module, following the naming convention `backend-<folder-name>-projects.instructions.md`:

### Core Architecture Layers (Following 7-Layer Backend Architecture)

| Layer | Folder | Instruction File | Purpose |
|-------|--------|------------------|---------|
| 1 | `routes/` | `backend-routes-projects.instructions.md` | HTTP endpoint mapping, middleware orchestration |
| 2 | `validators/` | `backend-validators-projects.instructions.md` | Zod schemas, input validation, sanitization |
| 3 | `controllers/` | `backend-controllers-projects.instructions.md` | HTTP request handling, response formatting |
| 5 | `services/` | `backend-services-projects.instructions.md` | Business logic, database operations |
| 6 | `utils/` | `backend-utils-projects.instructions.md` | Pure functions, data transformations |
| 7 | `types/` | `backend-types-projects.instructions.md` | TypeScript interfaces, DTOs, domain models |

## 🎯 Key Features of Each Instruction File

### 1. `backend-routes-projects.instructions.md`
- **Focus**: RESTful API design, middleware chains, authentication/authorization
- **Coverage**: 
  - CRUD operations (`POST /`, `GET /`, `PUT /:id`, `DELETE /:id`)
  - Advanced endpoints (`GET /search`, `PATCH /:id/status`, `GET /stats`)
  - Role-based access control (CLIENT vs ADMIN permissions)
  - Security middleware integration
  - Performance optimization patterns

### 2. `backend-validators-projects.instructions.md`
- **Focus**: Comprehensive input validation using Zod 4.0+
- **Coverage**:
  - Project creation/update validation schemas
  - Query parameter validation with transforms
  - Cross-field business rule validation
  - Security-first input sanitization
  - Financial data validation (token economics, investment metrics)

### 3. `backend-controllers-projects.instructions.md`
- **Focus**: HTTP request/response handling, service layer integration
- **Coverage**:
  - Authentication context management (`AuthenticatedRequest`)
  - Comprehensive error handling with `createError()`
  - Role-based access control enforcement
  - Validation integration patterns
  - Response formatting standards

### 4. `backend-services-projects.instructions.md`
- **Focus**: Business logic implementation, database operations
- **Coverage**:
  - Complex business workflows (project lifecycle, status management)
  - Prisma database operations with transactions
  - Tokenization calculations and blockchain integration
  - Data aggregation for analytics and reporting
  - Cross-module service coordination

### 5. `backend-utils-projects.instructions.md`
- **Focus**: Pure functions, mathematical calculations, data transformations
- **Coverage**:
  - Financial mathematics (IRR, NPV, ROI calculations)
  - Token economics calculations
  - Data mapping between DTOs and entities
  - Currency/percentage formatting utilities
  - Data validation helpers

### 6. `backend-types-projects.instructions.md`
- **Focus**: Type definitions, interfaces, DTOs, domain models
- **Coverage**:
  - Core domain models (`Project`, `Property`, `Token`)
  - API DTOs with proper serialization
  - Query/filter interfaces
  - Business logic types (ROI projections, analytics)
  - Error types and validation interfaces

## 🏗️ Architectural Compliance

Each instruction file enforces the **mandatory 7-layer backend architecture**:

```
Route → Middleware → Validator → Controller → Service → Utils → Types
  1        N/A         2           3          5       6      7
```

### Key Architectural Rules Enforced:

1. **Layer Isolation**: Each layer only communicates with adjacent layers
2. **Single Responsibility**: Each layer has clearly defined responsibilities
3. **No Cross-Cutting**: Business logic stays in services, validation in validators
4. **Type Safety**: Strong TypeScript typing throughout all layers
5. **Error Handling**: Consistent error handling patterns across layers
6. **Security First**: Authentication, authorization, and input sanitization

## 💼 Real Estate Tokenization Focus

All instruction files are specifically designed for a **professional real estate tokenization platform** with:

### Business Domain Coverage:
- **Project Management**: Real estate investment project lifecycle
- **Tokenization Logic**: Token economics, pricing, allocation calculations
- **Investment Analytics**: ROI projections, market analysis, performance tracking
- **Client Operations**: Multi-tenant project management with role-based access
- **Regulatory Compliance**: Audit trails, financial precision, compliance reporting

### Technical Requirements:
- **Financial Precision**: Decimal arithmetic for monetary calculations
- **Multi-Tenant Security**: Client isolation and ownership validation
- **Role-Based Access**: CLIENT, ADMIN, INVESTOR permission models
- **Session Authentication**: Integration with Passport.js session management
- **Performance Optimization**: Caching, pagination, efficient database queries

## 🔧 Implementation Standards

### Code Quality Standards:
- **TypeScript First**: Strong typing, no `any` types
- **Pure Functions**: Stateless utilities, predictable outputs  
- **Error Handling**: Comprehensive error types with detailed messages
- **Testing Coverage**: Unit tests, integration tests, property-based tests
- **Documentation**: JSDoc comments, API documentation, business logic explanations

### Security Standards:
- **Input Validation**: Comprehensive Zod schemas with sanitization
- **Authentication**: Session-based auth with role enforcement
- **Data Protection**: Sensitive data handling, field-level permissions
- **Audit Logging**: Security event tracking and compliance logging

### Performance Standards:
- **Database Optimization**: Efficient queries, proper indexing, pagination
- **Caching**: Memoization, response caching, calculation caching
- **Memory Efficiency**: Lazy loading, streaming, efficient data structures
- **Rate Limiting**: API abuse prevention, reasonable operation limits

## 🚀 Production Readiness

Each instruction file ensures **production-grade implementation** with:

- **Scalability**: Patterns supporting platform growth and high-volume operations
- **Maintainability**: Clean code organization, modular architecture, clear separation of concerns
- **Reliability**: Comprehensive error handling, transaction safety, data consistency
- **Security**: Enterprise-grade security controls, compliance with financial regulations
- **Observability**: Proper logging, monitoring hooks, performance tracking

## 📋 Usage Guidelines

### For Developers:
1. **Read the relevant instruction file** before working on any folder
2. **Follow the architectural patterns** outlined in each instruction
3. **Use the code examples** as templates for implementation
4. **Implement the testing patterns** described in each file
5. **Maintain the security standards** specified for each layer

### For Code Reviews:
1. **Verify architectural compliance** against instruction requirements
2. **Check security implementations** match instruction specifications
3. **Validate testing coverage** meets instruction standards
4. **Ensure documentation** follows instruction guidelines

### For System Architecture:
1. **All modules** should follow the same 7-layer architectural pattern
2. **Cross-module integration** should respect layer boundaries
3. **New features** should be implemented following these instruction patterns
4. **Legacy code** should be refactored to match these architectural standards

---

This comprehensive instruction set ensures **consistent**, **secure**, **scalable**, and **maintainable** implementation of the real estate tokenization platform's Projects module, serving as the foundation for **enterprise-grade financial software** development.
