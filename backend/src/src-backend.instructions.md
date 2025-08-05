---
applyTo: 'backend/src'
---
# Backend SRC Instructions
The folder named "src" is the source code folder for the backend.

## 🏗️ MANDATORY BACKEND ARCHITECTURE

All code in backend/src MUST follow the strict 7-layer architecture:

### ✅ routes/
- Define API endpoints only
- Connect URL + HTTP method to controller functions
- NO business logic, validation, or database access
- Only route definition and handler assignment

### ✅ middleware/
- Pre-route processing functions
- Authentication, authorization, logging, rate limiting
- Can attach data to request object
- NO business logic or direct database access

### ✅ controllers/
- Handle HTTP requests and responses
- Extract/validate request data
- Call appropriate service functions
- Format and return responses
- NO business logic or database calls

### ✅ validators/
- Request data validation schemas
- Ensure proper data formatting and required fields
- Used by controllers before calling services
- NO logic, side effects, or database access

### ✅ services/
- **CORE BUSINESS LOGIC LAYER**
- All database interactions via Prisma
- Business rule execution
- Data processing and workflows
- **ONLY place where Prisma should be used**

### ✅ utils/
- Reusable, stateless helper functions
- Pure functions for formatting, conversion, etc.
- NO database access or request handling

### ✅ types/
- TypeScript type definitions and enums
- Structural definitions for type safety

## 🔐 MANDATORY SESSION MANAGEMENT & AUTHENTICATION

**CRITICAL**: Session management is MANDATORY and must be implemented in the config/ folder.

### ✅ config/ folder requirements:
- `config/session.ts` - Express session configuration with Prisma store
- `config/passport.ts` - Passport serialization/deserialization setup
- Both files are REQUIRED for authentication to function

### ✅ Session Management Implementation:
1. **Session Store**: Must use `@quixo3/prisma-session-store` with Prisma
2. **Serialization**: `passport.serializeUser()` to store user ID in session
3. **Deserialization**: `passport.deserializeUser()` to retrieve user from database
4. **Integration**: Must be configured in main app.ts before route handlers

### ⚠️ WITHOUT session management:
- OAuth authentication WILL FAIL
- User login state will NOT persist
- `req.user` will be UNDEFINED
- Authentication middleware will NOT work

### ✅ Required Dependencies:
```json
{
  "express-session": "^1.18.2",
  "@quixo3/prisma-session-store": "latest",
  "@types/express-session": "latest"
}
```
- NO logic or functionality

### ✅ strategies/ (for auth modules)
- Third-party authentication configurations
- OAuth provider setups (Google, Azure, etc.)
- Passport strategy configurations

## 🔄 REQUEST FLOW
Route → Middleware → Validator → Controller → Service → Database (Prisma)

## ✅ PRISMA USAGE RULE
**Prisma database client can ONLY be used in services/ folder.**
This ensures clean architecture, testability, and maintainability.

For the backend, Express.js is used as the web framework.
For the database, PostgreSQL is used.
The backend is structured to handle various functionalities such as user authentication, data processing, and API endpoints.
The source code is organized into modules, each responsible for a specific part of the application.
The backend communicates with the frontend through RESTful APIs.
Ensure to follow best practices for security, such as input validation and error handling.
The src folder contains the main application logic, including routes, controllers, and services.
The backend/src/config folder contains configuration files for the application, such as database connection settings and environment variables.
The backend/src/docs folder contains API documentation, which is generated from the source code comments.
The backend/src/midleware folder contains middleware functions that process requests before they reach the route handlers.
The backend/src/modules folder contains the main application modules, each encapsulating specific functionality.
The backend/src/prisma folder contains the Prisma ORM setup, which is used for database interactions.
The backend/src/services folder contains service classes that encapsulate business logic and data manipulation.
The backend/src/tmp folder is used for temporary files and should not be committed to version control.
The backend/src/types folder contains TypeScript type definitions used throughout the application.
The backend/src/utils folder contains utility functions that are used across different parts of the application.
The backend/src/server.ts file is the entry point of the application, where the Express server is initialized and configured.