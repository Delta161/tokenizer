---
applyTo: `backend/src/modules/accounts/controllers/kyc.controller.ts`
---

### 📄 File: `kyc.controller.ts`

**Purpose:**  
Handles KYC (Know Your Customer) operations for authenticated users.
Provides endpoints for submitting, retrieving, and managing KYC verification data.

## 🏗️ MANDATORY BACKEND ARCHITECTURE - KYC CONTROLLER

This controller is **Layer 3** in the mandatory 7-layer backend architecture:

**Route → Middleware → Validator → 🎯 KYC CONTROLLER → KYC Service → Utils → Types**

### ✅ KYC Controller Responsibilities (Layer 3)

KYC controllers handle HTTP requests for KYC verification:

- **Extract KYC data** from request (body, files, params)
- **Validate user authentication** and KYC permissions
- **Call KYC service methods** for verification logic
- **Handle KYC submissions** and status updates
- **Format KYC responses** with proper HTTP status codes
- **Handle KYC-specific errors** by forwarding to error middleware

### ❌ What KYC Controllers Should NOT Do

- **NO KYC business logic** - delegate to KYC service
- **NO database calls** - KYC service handles all Prisma interactions
- **NO document processing** - KYC service handles file processing
- **NO verification logic** - use KYC service for verification workflows
- **NO provider integration** - KYC service handles third-party providers
- **NO direct Prisma usage** - only services can use Prisma

### 🔄 KYC Controller Flow Pattern

```typescript
export const submitKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract user and KYC data
    const userId = req.user?.id;
    const kycData = req.body;
    const documents = req.files;
    
    // 2. Basic validation
    if (!userId) {
      throw createError(401, 'User not authenticated');
    }
    
    // 3. Call KYC service
    const kycRecord = await kycService.submitKycData(userId, kycData, documents);
    
    // 4. Return response
    res.status(200).json({
      success: true,
      data: kycRecord,
      message: 'KYC data submitted successfully'
    });
  } catch (error) {
    next(error);
  }
};

export const getKyc = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Extract user context
    const userId = req.user?.id;
    
    // 2. Basic validation
    if (!userId) {
      throw createError(401, 'User not authenticated');
    }
    
    // 3. Call KYC service
    const kycRecord = await kycService.getUserKycRecord(userId);
    
    // 4. Return response
    res.status(200).json({
      success: true,
      data: kycRecord
    });
  } catch (error) {
    next(error);
  }
};
```

### 🔄 KYC Management Operations

```typescript
// KYC status management
export const updateKycStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, reason } = req.body;
    
    const updatedKyc = await kycService.updateKycStatus(id, status, reason);
    
    res.status(200).json({
      success: true,
      data: updatedKyc
    });
  } catch (error) {
    next(error);
  }
};

// KYC provider operations
export const initiateKycVerification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    const { provider } = req.body;
    
    if (!userId) {
      throw createError(401, 'User not authenticated');
    }
    
    const verificationSession = await kycService.initiateVerification(userId, provider);
    
    res.status(200).json({
      success: true,
      data: verificationSession
    });
  } catch (error) {
    next(error);
  }
};

// Admin KYC management
export const getAllKycRecords = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const result = await kycService.getAllKycRecords({
      status: status as string,
      page: Number(page),
      limit: Number(limit)
    });
    
    res.status(200).json({
      success: true,
      data: result.records,
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total
      }
    });
  } catch (error) {
    next(error);
  }
};
```

### 🔒 KYC Security & Privacy

KYC operations require special security considerations:

- **Authentication Required**: All KYC endpoints require valid user session
- **Sensitive Data**: Never log or expose KYC data in responses
- **File Handling**: Secure document upload and storage
- **Privacy Compliance**: Follow data protection regulations
- **Audit Trail**: Track all KYC operations for compliance

### ✅ Architecture Compliance Rules

1. **KYC Service Only**: All KYC logic must be in KYC service
2. **No Prisma**: Controllers cannot directly use Prisma client
3. **Security First**: Never expose sensitive KYC data
4. **Error Forwarding**: Use `next(error)` for centralized error handling
5. **File Handling**: Use middleware for secure file uploads

### 🧱 Structure

**Exports:**
1. `submitKyc`: POST endpoint for submitting user KYC form data
2. `getKyc`: GET endpoint for retrieving previously submitted KYC data
3. `updateKycStatus`: Admin endpoint for updating KYC verification status
4. `initiateKycVerification`: Start third-party KYC verification process
5. `getAllKycRecords`: Admin endpoint for managing all KYC records

### ✅ Coding Standards

- Use `async` functions with `try/catch` blocks
- Import `Request`, `Response`, and `NextFunction` from `express`
- Use `http-errors` to throw standardized errors
- Validate `req.user` presence; throw `401 Unauthorized` if missing
- Return JSON responses with consistent structure
- Forward errors using `next(error)` for centralized handling
