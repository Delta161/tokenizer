The folder named "backend" is the backend folder.
For the backend express.js is used.
For the database PostgreSQL is used.
The database is named "tokenizer_dev".
The database is hosted on localhost.
The database is port 5432.
Prisma is used for communication with the database
The backend test server is http://localhost:3000
The prisma client is located at : backend\node_modules\@prisma\client
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
- cookie-parser@1.4.7
- ethers@6.15.0
- express-session@1.18.1
- express@5.1.0
- hardhat@2.26.0
- jsonwebtoken@9.0.2
- multer@2.0.2
- passport-apple@2.0.2
- passport-azure-ad@4.3.5
- passport-google-oauth20@2.0.0
- passport@0.7.0
- prisma@6.11.1
- ts-node-dev@2.0.0
- typescript@5.8.3
- zod@4.0.5

## 1. Architecture & Structure

1. **Modular Layout**
   * Every feature lives under `backend/modules/<module>/`
   * Inside each module: flat files named `<module>.<layer>.ts` (no deep nesting)
   * Always include an `index.ts` for exports

2. **Layer Separation**
   * **Routes** only define paths and middleware
   * **Controllers** orchestrate validation → service calls → HTTP response
   * **Services** contain all business logic and Prisma queries
   * **Validators** use Zod schemas for all input (body, params, query)
   * **Types** declare DTOs and shared interfaces
   * **Utils** house mappers, helpers, adapters

3. **Consistent Naming**
   * `getUserById`, `createProperty`, `uploadDocument`, etc.
   * DTOs named `CreateXxxDto`, `UpdateXxxDto`, `XxxResponse`
   * Zod schemas named `CreateXxxSchema`, `GetXxxParamsSchema`


## 2. Security & Access Control

4. **Authentication**
   * OAuth 2.0 only (Google, Azure), JWT in HTTP-only cookies
   * Always apply `requireAuth` on non-public routes

5. **Authorization**
   * Use `requireRole('<ROLE>')` for role gating
   * Never trust `userId` or `propertyId` from client — derive from JWT

6. **Input Sanitization & Validation**
   * Rigorously validate every field with Zod before any logic
   * Reject unexpected or extra properties

## 3. Data & Schema

7. **Prisma First**
   * Update `backend/prisma/schema.prisma` for every new model/field
   * Keep migrations in `backend/prisma/migrations/`
   * Always include relation directives and `onDelete` behaviors

8. **DTO Layer**
   * Don’t return raw Prisma models — map to DTOs that expose only safe fields

## 4. Error Handling & Responses

9. **Structured Errors**
   * Throw or return errors with `{ statusCode, errorCode, message, details? }`
   * Use a global error handler middleware to format all errors

10. **HTTP Status Codes**
    * 200 OK, 201 Created, 204 No Content
    * 400 Bad Request for validation failures
    * 401 Unauthorized, 403 Forbidden
    * 404 Not Found, 409 Conflict for uniqueness

## 5. Logging & Monitoring
11. **Structured Logging**
    * Use a logger (e.g. Pino) with JSON output
    * Log incoming requests (method, path, userId) and errors

12. **Audit Hooks**
    * For security-sensitive actions, record an audit log entry

## 6. Performance & Scalability

13. **Efficient Queries**
    * Use Prisma’s `select`/`include` to fetch only needed fields
    * Use pagination (`take`/`skip` or `cursor`) for lists

14. **Rate Limiting (Future)**
    * Plan to apply per-route rate limits using `express-rate-limit`


## 7. Extensibility & Future-Proofing

15. **Adapter Patterns**
    * Abstract third-party integrations (storage, KYC providers) behind interfaces
    * Provide in-memory or no-op implementations for local dev

16. **Feature Flags & Config**
    * Read all credentials, URLs, feature toggles from `process.env`
    * Validate env vars at startup

## 8. Testing & Documentation

17. **Automated Tests**
    * Services and controllers should be unit- and integration-testable
    * Inject dependencies rather than importing singletons

18. **In-Code Docs**
    * Use JSDoc/TSDoc comments on public methods and DTOs
    * Maintain a brief README in each module if non-trivial





The folder named "frontend" is the frontend folder.
In the frontend folder, Vue.js is used.
The frontend test server is http://localhost:5173
