/**
 * KYC Routes - Simplified Implementation
 * No path aliases, direct imports only
 */

import { Router, Request, Response } from 'express';

console.log('✅ KYC routes module loaded');

const router = Router();

// GET /api/v1/kyc/health - Health check
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'KYC service is healthy!',
    timestamp: new Date().toISOString()
  });
});

// GET /api/v1/kyc/me - Get current user's KYC status (this is what frontend needs!)
router.get('/me', (req: Request, res: Response) => {
  console.log('✅ KYC /me endpoint accessed');
  
  // Mock KYC data matching what the frontend expects
  const mockKycData = {
    id: 'kyc-123',
    userId: 'user-456',
    status: 'not_submitted', // not_submitted, pending, verified, rejected
    submittedAt: null,
    reviewedAt: null,
    verifiedAt: null,
    rejectionReason: null,
    documentsUploaded: false,
    personalInfoComplete: false,
    addressVerified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.json({
    success: true,
    data: mockKycData,
    message: 'KYC status retrieved successfully',
    timestamp: new Date().toISOString()
  });
});

// POST /api/v1/kyc/submit - Submit KYC information
router.post('/submit', (req: Request, res: Response) => {
  console.log('✅ KYC /submit endpoint accessed');
  
  // Mock KYC submission
  res.json({
    success: true,
    message: 'KYC information submitted successfully',
    data: {
      id: 'kyc-123',
      status: 'pending',
      submittedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

// POST /api/v1/kyc/documents - Upload KYC documents
router.post('/documents', (req: Request, res: Response) => {
  console.log('✅ KYC /documents endpoint accessed');
  
  // Mock document upload
  res.json({
    success: true,
    message: 'KYC documents uploaded successfully',
    data: {
      documentId: 'doc-789',
      uploadedAt: new Date().toISOString()
    },
    timestamp: new Date().toISOString()
  });
});

console.log('✅ KYC routes exported');

export { router as kycRouter };
