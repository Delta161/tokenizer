The folder named "backend" is the backend folder.
For the backend express.js is used.
For the database PostgreSQL is used.
The database is named "tokenizer_dev".
The database is hosted on localhost.
The database is port 5432.
Prisma is used for communication with the database
The backend test server is http://localhost:3000
The prisma client is located at : backend\node_modules\@prisma\client
Save all files temporarly created for testing purposes in the backend\src\tmp folder
Delete all files in the backend\src\tmp folder after each test
Do not make backups of files before you delete them.
Validation and Sanitization must be done by Zod 4.0.5
The backend is using Zod 4.0.5 for validation and sanitization.
The backend is using Prisma 6.11.1 for database communication.
All http errors must be handled by http-errors package.




For the backend the following packages are used:

- PostgreSQL
- @prisma/client@6.11.1
- @types/cookie-parser@1.4.9
- @types/express@5.0.3
- @types/jsonwebtoken@9.0.10
- @types/multer@2.0.0
- @types/node@24.0.13
- @types/passport-google-oauth20@2.0.16
- @types/passport@1.0.17
- @types/pino@7.0.4
- @typescript-eslint/eslint-plugin@8.37.0
- @typescript-eslint/parser@8.37.0
- cookie-parser@1.4.7
- dotenv@17.2.0
- eslint@9.31.0
- ethers@6.15.0
- express-session@1.18.1
- express@5.1.0
- hardhat@2.26.0
- jsonwebtoken@9.0.2
- multer@2.0.2
- node-fetch@3.3.2
- passport-apple@2.0.2
- passport-azure-ad@4.3.5
- passport-google-oauth20@2.0.0
- passport@0.7.0
- prisma@6.11.1
- ts-node-dev@2.0.0
- typescript@5.8.3
- zod@4.0.5


### 1. Architecture & Structure
* **Modular Layout**:
  • Every feature in `backend/src/modules/<module>/`
  • Flat files: `<module>.<layer>.ts` plus `index.ts`
  • Every module consist aout of the following folders: 
    - **controllers**: validation → service calls → HTTP response
    - **services**: business logic + Prisma queries
    - **validators**: Zod schemas for body/params/query
    - **types**: DTOs and shared interfaces
    - **utils**: mappers, helpers, adapters
    - **constants**: hardcoded values, environment variables should always in the .env file
    - **env**: environment variables should always in the .env file
    - **test**: test files for the module
    - **test-utils**: test utils for the module
    

* **Layer Separation**:
  • **Routes**: only paths + middleware
  • **Controllers**: validation → service calls → HTTP response
  • **Services**: business logic + Prisma queries
  • **Validators**: Zod schemas for body/params/query
  • **Types**: DTOs and shared interfaces
  • **Utils**: mappers, helpers, adapters
* **Naming**:
  • Methods like `createUser`, `getPropertyById`
  • DTOs: `CreateXxxDto`, `XxxResponse`
  • Schemas: `CreateXxxSchema`, `GetXxxParamsSchema`

### 2. Security & Access Control
* **Authentication**: OAuth 2.0 (Google & Azure) only, JWT in HTTP-only cookies, always apply `requireAuth` on protected routes
* **Authorization**: `requireRole('<ROLE>')` for role gating; never trust client-supplied IDs
* **Validation**: Rigorously validate every input with Zod; reject extra fields
* **Test**:
  • Write tests for every public method
  • Use `supertest` for integration tests
  • Mock dependencies with `sinon`
  • Test edge cases and error scenarios
* **Test Utils**:
  • `test-utils` folder for test utils
  • `test-utils/setup.ts` for test setup
  • `test-utils/teardown.ts` for test teardown
  • `test-utils/factories.ts` for test data factories
  • `test-utils/mocks.ts` for test mocks
  • `test-utils/constants.ts` for test constants

### 3. Data & Schema
* **Prisma First**:
  • Update `schema.prisma` for every new model/field, run migrations under `backend/prisma/migrations/`
  • Use relations and `onDelete` cascade where appropriate
* **DTO Layer**: Never return raw Prisma models—map to DTOs exposing only safe fields

### 4. Error Handling & Responses
* **Structured Errors**: `{ statusCode, errorCode, message, details? }`
* **HTTP Status Codes**:
  • 200, 201, 204 for success
  • 400 for validation failures
  • 401/403 for auth errors
  • 404 for not found
  • 409 for uniqueness conflicts
* **Debugging via ESLint**:
  • **Must** run ESLint (with `@typescript-eslint/parser` and plugin) on all TypeScript files before audit/fixes
  • Address **all** lint errors (type mistakes, unused vars, style violations) as part of debugging

### 5. Logging & Monitoring
* **Structured Logging**: Use Pino (JSON) to log requests (method, path, userId) and errors
* **Audit Hooks**: Record security-sensitive actions in Audit Log Module

### 6. Performance & Scalability
* **Efficient Queries**: Use Prisma’s `select`/`include` to fetch only needed fields
* **Pagination**: Use `take`/`skip` or cursor-based for list endpoints

### 7. Extensibility & Future-Proofing
* **Adapter Patterns**: Abstract third-party integrations (storage, KYC, email) behind interfaces
* **Config & Env**: Read credentials, URLs, feature flags from `process.env`, validate at startup

### 8. Testing & Documentation
* **Automated Tests**: Services and controllers should be unit- and integration-testable; inject dependencies
* **In-Code Docs**: Use JSDoc/TSDoc on public methods and DTOs; include module README if non-trivial







The folder named "frontend" is the frontend folder.
In the frontend folder, Vue.js is used.
The frontend test server is http://localhost:5173


