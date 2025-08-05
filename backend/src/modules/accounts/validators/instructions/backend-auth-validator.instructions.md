---
applyTo: 'backend/src/modules/accounts/validators/auth.validator.ts'
---

### 📄 `auth.validator.ts`

#### Purpose

This file defines all validation logic related to the authentication flow within the `accounts` module. It ensures that any data related to OAuth 2.0 logins, user profile normalization, and user account creation is strictly validated and safely transformed before interacting with business logic or persistent storage.

---

#### Key Concepts

* **OAuth-Only Flow**
  Since authentication and registration are handled exclusively through OAuth 2.0 (Google and Azure AD), there is no need to validate credentials like passwords or usernames. Instead, the validator focuses on normalizing provider payloads, validating tokens, and generating placeholder or derived user data when required.

* **Strict Shape Validation**
  Every expected structure from third-party identity providers is rigorously defined using `zod` schemas. This ensures predictable downstream processing, type safety, and consistent fallbacks.

* **Safe Transformations**
  Profile information such as `email` and `fullName` are not just validated, but intelligently transformed to ensure they meet internal formatting and fallback requirements — crucial for handling incomplete or inconsistent provider data.

---

#### Structure and Responsibilities

* **Token Verification Schema**
  Validates access or ID tokens received from the OAuth provider. This is typically a non-empty string.

* **Profile Schemas**
  Encapsulate and validate raw and normalized user data coming from:

  * Google (`GoogleProfileSchema`)
  * Azure AD (`AzureProfileSchema`)
  * Generalized OAuth profile (`OAuthProfileSchema`)
  * Internally normalized structure (`NormalizedProfileSchema` and `RelaxedNormalizedProfileSchema`)

* **User Creation Schemas**
  Used when provisioning a new user based on a validated OAuth profile. These schemas enforce the presence of required identity fields such as `email`, `providerId`, `fullName`, and optionally, the user’s role.

* **Transformation and Processing Utilities**

  * `validateAndProcessEmail`: Sanitizes and standardizes email strings.
  * `validateAndProcessFullName`: Derives a fallback full name from incomplete OAuth profiles using a series of provider-aware heuristics.
  * `generatePlaceholderEmail`: Creates a deterministic placeholder email if none is provided.
  * `transformOAuthError`: Interprets Prisma and validation errors into user-friendly error messages and suggested actions.
  * `validateUserCreationData`: Applies schema validation for final user provisioning, raising actionable errors if any critical fields are missing.

* **Error Handling Schema**
  Centralized structure for converting OAuth-related errors into client-consumable messages, enriched with context like provider type and validation hints.

---

#### Design Best Practices

* Keep validation logic fully decoupled from controller and service logic.
* Always prefer `z.strict()` schemas for user creation to catch extra or invalid fields.
* Use schema refinement and transformations for fallback logic — avoid imperative validation in business logic.
* Maintain schema parity with the expected shape from identity providers and internal normalization requirements.
* Abstract profile-related edge-case handling (like missing display names or malformed emails) inside safe transformation utilities rather than repeating logic.

---

Let me know if you'd like `.instructions.md` files for the other validator files too (`kyc.validator.ts`, `user.validator.ts`) — I can generate them based on either your code or typical patterns.
