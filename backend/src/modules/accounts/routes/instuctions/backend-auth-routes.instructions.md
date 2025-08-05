---
applyTo: "backend/src/modules/accounts/routes/instructions/auth.routes.ts"
---

### `.instructions.md`

**Location:** `accounts/routes/auth.routes.ts`

---

#### 📌 Purpose

This file defines all **authentication-related HTTP endpoints** for the `accounts` module. It includes health checks, token verification, user profile retrieval, token management (refresh/logout), and OAuth 2.0 authentication flows via **Google** and **Azure Active Directory** using Passport.js.

---

#### ✅ Responsibilities

* Registering public and protected endpoints related to user authentication.
* Handling OAuth login flows with Passport strategies.
* Delegating business logic to the `authController`.
* Integrating guards (`authGuard`, `optionalAuth`) for route protection.
* Serving as a single entry point for all auth-related Express routes.

---

#### 🧩 Key Structure

* `/health`: Basic health check (no auth required).
* `/verify-token`: Validates the current access token.
* `/profile`: Fetches authenticated user's profile.
* `/refresh-token`: Issues a new access token using a refresh token.
* `/logout`: Logs the user out (invalidates tokens, if applicable).
* `/google` & `/google/callback`: Google OAuth flow.
* `/azure` & `/azure/callback`: Azure AD OAuth flow.
* `/error`: OAuth failure redirection handler.

---

#### 🔐 OAuth Strategy Expectations

* Uses Passport.js middleware to initiate and handle authentication.
* OAuth routes redirect to the `FRONTEND_URL` with error details on failure.
* Passport strategy configuration (e.g., scopes, prompts) is **not defined here** — that belongs in the respective strategy files (e.g., `google.strategy.ts`).

---

#### 🚨 Middleware Usage

* `authGuard`: Ensures the request is authenticated (e.g., `/profile`).
* `optionalAuth`: Accepts unauthenticated requests but enriches with user context if available (e.g., `/logout`).
* Passport middleware is used directly on OAuth routes (e.g., `passport.authenticate(...)`).

---

#### 🔄 Binding Controllers

* All controller methods are bound using `.bind(authController)` to preserve context.
* No business logic should exist in this file — delegation to the controller layer is required.

---

#### 🧼 Best Practices Followed

* Clean separation of route definitions and business logic.
* Proper use of middleware and HTTP verbs.
* Explicit and semantic route structure.
* Logging is present to indicate route configuration status (`logger.info(...)`).

---

#### ⚠️ Constraints

* This module **only supports OAuth 2.0** login and registration.
* There are no local login or password-based flows (e.g., no `/register` or `/login` with credentials).

---