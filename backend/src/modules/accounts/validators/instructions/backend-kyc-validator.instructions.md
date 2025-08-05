---
applyTo: 'backend/src/modules/accounts/validators/kyc.validator.ts'
---

### 📄 File: `kyc.validator.ts`

This file contains Zod-based schemas dedicated to validating Know Your Customer (KYC) operations within the **Accounts module**. It is designed for clarity, security, and robustness in handling user identity verification workflows, primarily supporting KYC submission and admin-side status updates.

---

### ✅ Purpose

* Validate KYC submission data provided by users.
* Ensure admin updates to KYC status comply with business logic and data integrity requirements.
* Encapsulate KYC-related validation logic in a centralized, maintainable schema layer.
* Enforce domain rules (e.g. rejection must include a reason) with field-level and cross-field validation.

---

### 📦 Schema Guidelines

#### 1. **KycSubmissionSchema**

* Validates the submission payload from end users.
* Ensures `documentType` is a concise identifier, limited to 50 characters.
* Enforces ISO 3166-1 alpha-2 compliance by requiring a 2-letter country code.

#### 2. **KycUpdateSchema**

* Used by admins to update the KYC status of a user.
* Restricts `status` to the defined `KycStatus` enum values (`PENDING`, `VERIFIED`, `REJECTED`).
* Optionally accepts a `rejectionReason`, up to 500 characters.
* Accepts `null` or `undefined` only when rejection is not the selected status.

#### 3. **KycUpdateSchemaWithRefinement**

* Adds business logic that **requires** a `rejectionReason` if the `status` is `REJECTED`.
* Uses `superRefine` for cross-field validation, which Zod does not support natively in basic schemas.
* Prevents incomplete or invalid admin actions by explicitly surfacing contextual validation errors.

---

### 🛡 Best Practices

* Always use `superRefine` for interdependent field logic (like conditional requirements).
* Keep field-level validation concise and declarative.
* Default to optional chaining for admin fields, but enforce business constraints where applicable.
* Align country code validation with internationally accepted standards.
* Modularize status values using centralized enums from `kyc.types` for consistency across the codebase.
* Do not mix schema logic with processing or database concerns. This file should only validate and enforce structure.

---

### 📌 Usage Context

These schemas are invoked in the following contexts:

* **KYC form submission endpoints** in API routes.
* **Admin dashboard tools** used to verify or reject submitted KYC requests.
* **Service layers** that apply rules before persisting KYC state to the database.

---

### 🧩 Extendability Notes

* If more document types or countries need special handling, introduce controlled enums or country code validation layers (ISO dataset).
* Future additions such as expiration dates, issuing authorities, or document uploads should be added as new fields with explicit validation.
* Consider internationalization of error messages through Zod’s custom error maps if needed.

---