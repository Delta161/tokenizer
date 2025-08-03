/**
 * Auth Routes
 * Simplified authentication routes without path aliases
 */

import { Router } from 'express';

// Create router
const router = Router();

console.log('✅ Auth routes module loaded');

// Health check
router.get('/health', (req, res) => {
  console.log('✅ Auth health check accessed');
  res.json({ 
    success: true, 
    message: 'Auth service is healthy!',
    timestamp: new Date().toISOString()
  });
});

// Token verification endpoint - this is what the frontend needs!
router.get('/verify-token', (req, res) => {
  console.log('✅ Auth verify-token (GET) accessed');
  
  // Get token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  console.log('🔍 Token provided:', !!token);
  
  if (token) {
    // For now, accept any token that exists - later we can add proper JWT validation
    res.json({
      valid: true,
      message: 'Token is valid',
      user: {
        id: 'verified-user-123',
        email: 'verified@example.com',
        firstName: 'Verified',
        lastName: 'User',
        role: 'user'
      }
    });
  } else {
    // No token provided
    res.status(401).json({
      valid: false,
      message: 'No token provided'
    });
  }
});

// POST version for compatibility
router.post('/verify-token', (req, res) => {
  console.log('✅ Auth verify-token (POST) accessed');
  
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
  
  if (token) {
    res.json({
      valid: true,
      message: 'Token is valid (POST)',
      user: {
        id: 'verified-user-123',
        email: 'verified@example.com',
        firstName: 'Verified',
        lastName: 'User',
        role: 'user'
      }
    });
  } else {
    res.status(401).json({
      valid: false,
      message: 'No token provided'
    });
  }
});

// Basic logout endpoint
router.post('/logout', (req, res) => {
  console.log('✅ Auth logout accessed');
  
  // Clear any cookies and respond with success
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  
  res.json({
    success: true,
    message: 'Logged out successfully',
    timestamp: new Date().toISOString()
  });
});

// OAuth routes - simplified stubs for now
// These can be enhanced later when the path alias issues are resolved

// Google OAuth placeholder
router.get('/google', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Google OAuth not yet implemented in simplified routes',
    redirectTo: '/login'
  });
});

router.get('/google/callback', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Google OAuth callback not yet implemented',
    redirectTo: '/login'
  });
});

// Azure OAuth placeholder
router.get('/azure', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Azure OAuth not yet implemented in simplified routes',
    redirectTo: '/login'
  });
});

router.get('/azure/callback', (req, res) => {
  res.status(501).json({
    success: false,
    message: 'Azure OAuth callback not yet implemented',
    redirectTo: '/login'
  });
});

// Handle OAuth errors
router.get('/error', (req, res) => {
  console.log('✅ Auth error endpoint accessed');
  res.status(400).json({
    success: false,
    message: 'Authentication error occurred',
    timestamp: new Date().toISOString()
  });
});

export { router as authRouter };

console.log('✅ Auth routes exported');
