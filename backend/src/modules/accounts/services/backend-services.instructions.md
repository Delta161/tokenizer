---
applyTo: `backend/src/modules/accounts/services`  
---

### 📁 Folder: `backend/src/modules/accounts/services`

**Purpose:**
This folder contains the core business logic related to account operations. Each service encapsulates domain-specific logic and interacts with database, blockchain, authentication, or other platform services. It is the middle layer between the controller and Prisma/database layer.


---

### ✅ General Guidelines:

1. **One Service Per Domain**

   * Containes a seperate service file for every seperate domain
   - auth.service.ts
   - user.service.ts
   - kyc.service.ts

   * Keep each service focused on a single responsibility.

2. **Business Logic Layer**

   * All complex operations or transformations should live here, not in the controllers.
    * Controllers should only handle HTTP requests and responses.
    * Services should handle all business logic, data validation, and transformations.
    * Controllers should call service methods to perform operations.
    * Services should not depend on controllers or HTTP-specific logic.
    * Services should not directly access the database or Prisma client.
    * Use services to encapsulate complex logic that may involve multiple steps or data sources.
    * Services should be reusable across different controllers or modules.
    * Services should not contain any HTTP-specific logic (e.g., request/response handling).
    * Services should not contain any authentication or authorization logic.
    * Services should not contain any routing logic.
    * Services should not contain any middleware logic.
    * Services should not contain any error handling logic.
    * Services should not contain any logging logic.
    * Services should not contain any caching logic.
    * Services should not contain any rate limiting logic.
    * Services should not contain any security logic.
    * Services should not contain any validation logic.
    * Services should not contain any formatting logic.
   * Services are the only place to coordinate between multiple data sources or APIs.

3. **Pure Methods Where Possible**

   * Avoid side-effects unless required (e.g., writing to the database or external APIs).
   * Use helper functions if logic becomes too large within the service.

4. **Handle Errors Gracefully**

   * Catch and rethrow domain-specific errors to allow clean controller responses.
   * Prefer custom error classes for meaningful exception propagation.

5. **Keep Dependencies Explicit**

   * Inject required utilities, Prisma client, or external services via constructor or top-level import.
   * Avoid importing from unrelated services or controller layers.

6. **No HTTP or Routing Logic**

   * Do not include Express-related logic (no `req`, `res`, or routing).
   * Services should be framework-agnostic and callable from CLI, schedulers, or jobs.

7. **Reusable Across Modules**

   * If a service is reusable in other modules, consider moving it to `shared/services/`.

8. **Typed Input and Output**

   * Use `Zod` types, interfaces, or DTOs to validate and type function parameters.
   * Always return typed values for predictability and auto-completion.

9. **Blockchain Logic**

   * Any business logic tied to minting, transferring tokens, or querying on-chain state goes here.
   * Use the Blockchain Module to interact with smart contracts (do not embed Ethers logic directly).

10. **Keep File Size Manageable**

    * If a service file grows too large, split it into logical sub-services and aggregate under an index or orchestrator.

---

Let me know if you'd like a markdown version or if you're working on an internal developer handbook.
