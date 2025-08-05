---
applyTo: 'backend/src/modules/accounts/routes/*.ts'
---

### 📁 Folder: `routes`

This folder defines and exports the route handlers for the **Accounts module**, mapping HTTP endpoints to controller logic. It acts as the entry point for all incoming requests to account-related subdomains (auth, user, KYC), registering middleware, validators, and controller functions in a clean and modular structure.

---

### 🎯 Purpose

* Organize routing logic per domain: `auth`, `user`, and `kyc`.
* Clearly define RESTful endpoints for each domain.
* Register and apply relevant **validators**, **middlewares**, and **controller handlers**.
* Maintain separation of concerns: no business logic or data transformation should occur in route files.

---

### 📦 Folder Contents

#### 1. `auth.routes.ts`

* Maps routes for authentication and OAuth flows.
* Common routes include OAuth login, callback, and token refresh endpoints.
* Should ensure no traditional login/registration (OAuth-only).

#### 2. `user.routes.ts`

* Defines routes for user management (e.g. listing, updating, retrieving user profiles).
* Often protected with authentication middleware.
* Incorporates request validation for user updates, filtering, and sorting.

#### 3. `kyc.routes.ts`

* Registers endpoints for submitting, updating, and viewing KYC data.
* Typically restricted to authenticated users (submission) or admin roles (approval and review).
* Applies KYC-specific middleware and schema validation.

---

### 🧱 Structure & Best Practices

* **Route Declaration**: Use `express.Router()` per file, export it as the default.
* **Path Naming**: Use RESTful, semantic endpoint names (e.g., `GET /users/:id`, `POST /kyc`).
* **Middleware Composition**: Apply authentication, authorization, and domain-specific middleware in the correct order.
* **Validation Integration**: Run `zod` schemas from the `validators` folder to validate body, query, and params.
* **Controller Delegation**: Delegate the actual request logic to controller functions only (imported from `controllers/`).
* **Avoid Side Effects**: Do not perform I/O, logging, or external API calls directly in route files.

---

### 🛡 Security Guidelines

* Always enforce **authentication middleware** on routes that access or modify protected resources.
* Apply **role-based authorization** for admin-only operations (e.g., updating KYC status).
* Sanitize and validate all input at the entry point using the appropriate Zod schemas.

---

### 🔁 Reusability & Scalability

* Keep each domain’s routes in its own file for modularity.
* If the project grows, you can nest sub-routers (e.g., `/users/:userId/kyc`) by composing smaller routers in these files.
* Route files should remain small and readable—aim to express logic through function composition, not inline handlers.

---

### 🧩 Integration

Route files are consumed by the module's main router loader (e.g., `/src/app.ts` or `/src/router/index.ts`) where they're mounted under a common namespace like `/api/accounts` or `/accounts`.

---

### 🧼 Maintenance Tips

* Maintain one responsibility per route file; do not mix unrelated logic.
* Consistently order route handlers: validators → middleware → controller.
* When deprecating endpoints, clearly mark them and remove from route files promptly.

---

This folder is the entry point to your module’s API surface. It should remain declarative, focused, and tightly aligned with both middleware and controller design patterns.

---
