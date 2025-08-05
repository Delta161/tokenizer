---
applyTo: 'backend/src/modules/accounts/validators/*.ts'
---

#### Purpose of This Folder

This folder holds all schema validation logic for the `accounts` module. Validators here are used to enforce data integrity, shape, and business rules before reaching service or controller layers.

Validators operate as the first line of defense against malformed, incomplete, or maliciously crafted data. They are explicitly tied to the domain logic of this module and aim to isolate and modularize validation concerns across the `auth`, `user`, and `kyc` domains.

---

#### Core Design Principles

* **Strict Separation of Concerns**
  Validation schemas are decoupled from middleware, routes, and business logic to enhance clarity, testability, and maintainability.

* **Domain-Specific Responsibility**
  Each file in this folder must only validate data related to its respective concern (`auth`, `kyc`, or `user`). There should be no shared cross-domain logic here.

* **OAuth-Only Authentication Consideration**
  Since this platform exclusively uses OAuth 2.0 for authentication and registration, no validation schemas should attempt to check credentials like `email/password` or perform any password strength checks. Validation must focus only on OAuth-related payloads, e.g., strategy type, access token handling, or identity provider metadata if necessary.

* **Zod-First Approach**
  All validators must use the `zod` schema library. Zod is the project-wide standard and must be consistently used to enforce types, field constraints, value refinements, and structured error feedback.

* **Sync With DTOs and Types**
  Validators must closely reflect the structure of expected DTOs and input types defined in the module’s `types/` folder. Validation files do not define business rules but only enforce shape and field-level constraints.

---

#### What Belongs in This Folder

* Input validation schemas for:

  * OAuth callback handling
  * KYC form submissions
  * User profile updates
  * Domain-specific metadata updates (e.g. connected wallet address validation)

* Optional helper functions specific to field refinement (e.g. `isValidNationalID` or `isCountryCodeAllowed`), but only if relevant to the `accounts` domain.

---

#### What Does *Not* Belong in This Folder

* Business rules or logic like “user must be verified to proceed” — these belong in service or middleware layers.
* Reusable generic validators (these go in a `shared/validators` folder if needed globally).
* Validation middleware — those live inside the `middleware/` folder.

---

#### File Structure Expectations

* Each file name follows the convention: `[domain].validator.ts`
  Example: `auth.validator.ts` → handles all auth-related request validations.

* Each file must export one or more Zod schemas and expose a named object for clarity.
  For example: `export const AuthValidator = { loginCallbackSchema, providerRedirectSchema }`

* Validators should include comments explaining any complex validation logic or reasoning behind certain refinements.

---

#### Validation Usage Flow

Validators are consumed:

1. Inside domain middleware (`auth.middleware.ts`, `user.middleware.ts`, `kyc.middleware.ts`)
2. Or directly within controller endpoints if needed.
   They should always validate incoming request `body`, `params`, or `query` before business logic is executed.

---