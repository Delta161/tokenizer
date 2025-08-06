---
applyTo: '/backend/'
---
# Backend Instructions
The folder named "backend" is the backend folder.
For the backend, Express.js is used.
For the database, PostgreSQL is used.
The backend is responsible for handling API requests, managing data storage, and serving the frontend application.

## 🏗️ MANDATORY BACKEND ARCHITECTURE

The backend follows a strict 7-layer architecture that MUST be enforced in all modules:

### ✅ routes/
This is where all your API endpoints are defined.

Each route simply connects a URL and HTTP method (like GET /users) to a controller function. No logic, no validation, and definitely no database access should live here. Its only purpose is to define what happens when a certain API endpoint is hit.

### ✅ middleware/
Middleware functions run before the route handlers.

These are used for authentication, authorization, logging, rate limiting, and similar cross-cutting concerns. For example, you'd use middleware to check if the user is logged in before allowing them to access protected routes.

Middleware can attach things to the request (like the authenticated user), but shouldn't handle business logic or touch the database directly.

### ✅ controllers/
Controllers handle the incoming HTTP request and prepare the HTTP response.

They extract relevant data from the request, validate it if necessary, and then call the appropriate service functions to perform the actual business logic. Afterward, they send a structured response back to the client.

Controllers should not contain business logic or database calls. Their job is simply to act as the "bridge" between the request and your service layer.

### ✅ validators/
This folder contains schemas to validate incoming request data.

It ensures that all inputs to your system (such as user registration or KYC data) are properly formatted, required fields are present, and values meet the rules you've defined.

These are typically used in the controller layer before data is passed to services. No logic, no side effects, and no DB access here — just strict validation.

### ✅ services/
This is where all the core logic and data handling takes place.

Services are responsible for executing the business rules of your application and interacting with the database using the Prisma client. Everything that involves reading from or writing to the database happens here.

The controller passes data to the service, and the service decides how to process it — whether that's fetching a user, updating a record, or handling a more complex workflow like verifying KYC.

All Prisma logic should live here, and nowhere else.

### ✅ utils/
This folder holds reusable, stateless helper functions.

These are pure utility functions like formatting a date, generating a random ID, or converting data formats. They should never access the database or deal with incoming requests.

Think of this as your internal toolbox: low-level helpers that can be reused across services or controllers.

### ✅ types/
This is where you define TypeScript types and enums used across the module.

Types ensure consistency in how data is represented and passed around, reducing bugs and improving developer experience.

There's no logic here — just structural definitions to keep things type-safe and consistent.

### ✅ strategies/
This folder is dedicated to third-party authentication setups like OAuth.

It holds configuration logic for providers such as Google or Azure, usually using Passport strategies. These define how users log in, how callbacks are handled, and what data is retrieved during authentication.

This is the integration point for external identity providers — not for core logic or data handling.

## 🔄 How the Pieces Work Together
Here's the flow when a request hits your backend:

1. **Route** receives the HTTP request.
2. **Middleware** checks auth or other pre-conditions.
3. **Validator** ensures the request data is well-formed.
4. **Controller** receives the cleaned data and calls the appropriate service.
5. **Service** contains the business logic and talks to the database using Prisma.
6. **Utils** may be used by services or controllers for support.
7. **Response** is returned to the client.

## 🔐 MANDATORY SESSION-ONLY AUTHENTICATION

**CRITICAL**: This backend uses **PURE PASSPORT SESSION AUTHENTICATION ONLY**. No JWT tokens are used anywhere in the system. Session management is MANDATORY for proper user authentication and must be implemented across all authentication-related functionality.

### 🚨 **IMPORTANT - NO JWT TOKENS**
- **NO JWT token generation** anywhere in the system
- **NO JWT token validation** or middleware  
- **NO refresh tokens** or token-based endpoints
- **Only session-based authentication** using Passport sessions
- **HTTP-only session cookies** for client authentication

### ✅ Authentication Middleware (REQUIRED)
- **File Location**: `src/modules/accounts/middleware/session.middleware.ts`
- **Primary Guard**: `sessionGuard` - Protects routes requiring authentication
- **Optional Guard**: `optionalSession` - For routes that optionally use authentication
- **Usage**: Import and use `sessionGuard` instead of any JWT-based auth guards

**Example Route Protection:**
```typescript
import { sessionGuard } from '@/modules/accounts/middleware/session.middleware';

// Protected route
router.get('/me', sessionGuard, userController.getCurrentUser);

// Public route  
router.post('/login', authController.initiateOAuth);
```

### ✅ Session Configuration (REQUIRED)
- **File Location**: `src/config/session.ts`
- **Purpose**: Configures Express sessions with Prisma store for persistent session storage
- **Dependencies**: `express-session`, `@quixo3/prisma-session-store`
- **Database**: Requires `Session` model in Prisma schema

### ✅ Passport Configuration (REQUIRED)  
- **File Location**: `src/config/passport.ts`
- **Purpose**: Implements Passport serialization/deserialization for session management
- **Key Functions**:
  - `passport.serializeUser()` - Store user ID in session
  - `passport.deserializeUser()` - Retrieve full user object from database
  - OAuth strategy configuration (Google, Azure, Apple)

### ✅ Session Middleware Integration (REQUIRED)
Sessions MUST be configured in the main app.ts file in this exact order:
1. Body parsing middleware
2. Cookie parser
3. **Session configuration** (before Passport)
4. **Passport initialization**
5. **Passport session enable**
6. Route handlers

### ✅ Environment Variables (REQUIRED)
The following environment variables are MANDATORY for session management:
```env
SESSION_SECRET=your-super-secret-session-key
SESSION_MAX_AGE=604800000
SESSION_NAME=tokenizer.sid
SESSION_DOMAIN=localhost
```

### ✅ Database Schema (REQUIRED)
The Session model MUST be present in your Prisma schema:
```prisma
model Session {
  id        String   @id
  sid       String   @unique
  data      String
  expiresAt DateTime
  @@map("sessions")
}
```

### ⚠️ IMPORTANT: Without session management:
- User authentication will NOT persist across requests
- OAuth login will fail after callback
- `req.user` will be undefined in route handlers
- Login state will be lost on page refresh
- Authentication middleware will not function properly

Session management enables:
- ✅ Persistent user authentication across HTTP requests
- ✅ OAuth login flows to complete successfully
- ✅ `req.user` availability in route handlers
- ✅ Secure session storage with database persistence
- ✅ Proper logout functionality

## ✅ Where Prisma Should Be Used
The only place where Prisma (your database client) should be directly used is inside the **services** folder.

This keeps your architecture clean, testable, and easy to scale. Services are the one and only layer that should know how the data is stored or retrieved.
The backend communicates with the frontend through RESTful APIs, allowing for data exchange and user interactions.
The backend is structured to handle various functionalities such as user authentication, data processing, and integration with external services.
The backend code is organized into modules, each responsible for specific features or services.
The backend uses TypeScript for type safety and better development experience.
The backend is designed to be scalable and maintainable, following best practices in software development.
The backend is tested using unit tests and integration tests to ensure reliability and performance.
The backend is deployed on a server that supports Node.js applications, ensuring high availability and performance.
The backend is configured to handle CORS (Cross-Origin Resource Sharing) to allow requests from the frontend application.
The backend uses environment variables for configuration, ensuring sensitive information is not hard-coded.
The backend is monitored for performance and errors, allowing for proactive maintenance and improvements. 
The backend is documented using comments and README files, providing clear instructions for developers.
The backend is version controlled using Git, allowing for collaboration and tracking changes.
The backend is designed to be modular, allowing for easy updates and feature additions without affecting the entire system.
The backend follows RESTful principles, ensuring a consistent and predictable API structure.
The backend is optimized for performance, ensuring fast response times and efficient resource usage.
The backend is secured against common vulnerabilities, ensuring data integrity and user privacy.
The backend is designed to handle high traffic loads, ensuring reliability under heavy usage.
The backend is integrated with logging systems to track application behavior and diagnose issues.  
The backend is built with scalability in mind, allowing for horizontal scaling as needed.
The backend is designed to be easily deployable, with scripts and configurations for various environments.
The backend is continuously integrated and deployed using CI/CD pipelines, ensuring rapid development cycles.
The backend is designed to be compatible with various frontend frameworks, allowing for flexibility in UI development.  
The backend is structured to support both REST and GraphQL APIs, providing flexibility in data retrieval.
The backend is designed to handle asynchronous operations efficiently, using promises and async/await patterns.
The backend is equipped with error handling mechanisms to gracefully manage exceptions and provide meaningful feedback to users.
The backend is designed to support localization and internationalization, allowing for a global user base.
The backend is structured to support microservices architecture, allowing for independent deployment and scaling of services.
The backend is designed to be resilient, with mechanisms to recover from failures and maintain service continuity. 
The backend is built with a focus on developer experience, providing clear error messages and debugging tools.
The backend is designed to support real-time features, such as WebSockets, for live updates and notifications.
The backend is structured to allow for easy integration with third-party services and APIs, enhancing functionality and user experience.
The backend is designed to support session-based authentication only using Passport strategies 
to accommodate OAuth providers (Google, Microsoft, Apple).
The backend is built to handle data validation and sanitization, ensuring data integrity and security.  
The backend is designed to support data caching mechanisms, improving performance and reducing database load.
The backend is structured to allow for easy testing and debugging, with tools and frameworks that facilitate development.
The backend is designed to support logging and monitoring, providing insights into application performance and user behavior.
The backend is built to handle file uploads and storage, allowing users to manage files efficiently.
The backend is structured to support API versioning, allowing for backward compatibility and smooth transitions between versions
and features.
The backend is designed to support rate limiting and throttling, protecting against abuse and ensuring fair usage of resources.
The backend is built to support data encryption and secure communication, ensuring user data is protected during transmission.
The backend is structured to allow for easy integration with CI/CD tools, automating deployment and testing processes.
The backend is designed to support user roles and permissions, allowing for fine-grained access control.
The backend is built to handle background tasks and job scheduling, allowing for asynchronous processing of long-running operations.

the backend/logs folder contains logs related to the backend operations.
the backend/prisma folder contains the Prisma ORM configuration and schema files.
the backend/src folder contains the source code for the backend application.
the backend/tests folder contains unit and integration tests for the backend application.
the backend/.env file contains environment variables for the backend application.
the backend/package.json file contains the dependencies and scripts for the backend application.
the backend/tsconfig.json file contains the TypeScript configuration for the backend application.
the backend/README.md file contains instructions and documentation for the backend application.
the backend/.gitignore file specifies files and directories to be ignored by Git.
the backend/.eslintrc.json file contains the ESLint configuration for the backend application.
the backend/.prettierrc file contains the Prettier configuration for code formatting.
the backend/.github folder contains GitHub-specific configurations and workflows for the backend application.
