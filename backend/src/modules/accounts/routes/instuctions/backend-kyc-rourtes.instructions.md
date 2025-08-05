---
applyTo: "backend/src/modules/accounts/routes/kyc.routes.ts"
---
**Location:** `backend/src/modules/accounts/routes/kyc.routes.ts`

---

#### 📌 Purpose

This file defines all HTTP routes related to the **KYC (Know Your Customer)** functionality in the `accounts` module. It provides endpoints for health checking, retrieving KYC status, submitting KYC data, and uploading related documents.

---

#### ✅ Responsibilities

* Expose simplified, mock KYC API endpoints for use by the frontend during development.
* Simulate typical KYC flows including submission and document upload.
* Return structured, consistent JSON responses with metadata (timestamps, messages).
* Serve as a placeholder for real controller and service logic integration in the future.

---

#### 🧩 Key Endpoints

* `/health`: Verifies the availability of the KYC service.
* `/me`: Returns mock KYC status for the current (hardcoded) user.
* `/submit`: Mocks the KYC submission flow and returns a simulated “pending” status.
* `/documents`: Simulates successful document upload and returns basic document metadata.

---

#### ⚙️ Implementation Notes

* No actual authentication is implemented; these routes currently serve mock data.
* All route logic is embedded inline within the route definitions (temporary design).
* Hardcoded values (e.g. `kyc-123`, `user-456`) are used for demonstration purposes.
* Logging via `console.log` is used to indicate endpoint access and module loading.

---

#### 🚧 Temporary Nature

This file is clearly intended as a **temporary scaffold** or **mock server**:

* Real business logic is **not** delegated to a controller or service layer.
* There's no validation, authentication, or database interaction.
* No use of request middlewares, schemas, or guards yet.
* Responses are static, pre-defined, and not user-specific.

Once real KYC logic is implemented, this structure should be replaced by:

* Controller methods (`kycController`)
* Input validation using Zod schemas (`KycSubmissionSchema`)
* Authentication and authorization (`authGuard`)
* Integration with a KYC provider or internal KYC service layer

---

#### 🔐 Missing Considerations (Planned for Production)

* **Authentication Middleware**: Endpoints like `/me`, `/submit`, and `/documents` must be protected.
* **Validation**: Requests should be validated using Zod schemas.
* **Service Delegation**: Business logic should be offloaded to a service/controller layer.
* **User Context**: Replace hardcoded user and KYC IDs with actual user-specific data.
* **Error Handling**: Implement proper error handling using centralized error middleware.

---

#### 🧼 Best Practices (To Adopt in Future Iteration)

* Move inline logic into dedicated controller functions.
* Enforce authentication with `authGuard`.
* Use structured logging instead of `console.log`.
* Use DTOs or validators to ensure correct input shape.
* Replace mock responses with dynamic values from a data source or provider.

---
