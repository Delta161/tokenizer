---
applyTo: `backend/src/modules/accounts/services/*.service.ts`  
---


### 📁 `services/` Folder – Architecture & Best Practices

This folder contains all business logic and is the **only place where the Prisma Client should be directly accessed**.

---

### ✅ Purpose

* **Centralize domain logic** (e.g., authentication, user management, KYC).
* **Encapsulate Prisma queries** — no Prisma usage outside this layer.
* Provide reusable, testable methods consumed by controllers.

---

### 📌 Structure

Only the following service files should exist here:

services/
│
├── auth.service.ts   // Handles OAuth logic, token generation, session validation
├── kyc.service.ts    // KYC flow: status checks, verification result handling, user identity
└── user.service.ts   // User profile handling, updates, and role management
└── index.ts         // Exports all services for easy imports


---

### 💡 Best Practices

* **Direct Prisma usage only inside services**
  All database reads/writes must happen inside service methods.

* **No HTTP logic**
  Services must not parse `req`, `res`, or HTTP headers. That’s the controller’s job.

* **Reusability**
  Keep functions modular so other services (or cron jobs) can call them.

* **Validation logic**
  Services can perform logic validation (like checking user roles), but input validation (schema checks) belongs to middleware.

* **Error handling**
  Use consistent error throwing  with `http-errors` so that your global error handler can catch them.

---

### 🧪 Testing Note

Service methods should be independently testable with mocked Prisma clients.

---
