/**
 * Simple User Routes - Working Version
 * Fixes the 404 issue by removing path alias dependencies
 */

import { Router } from 'express';

// Create router
const router = Router();

console.log('✅ Simple user routes module loaded');

// Simple test route
router.get('/test', (req, res) => {
  console.log('✅ User test route accessed');
  res.json({ 
    success: true, 
    message: 'User routes are working!', 
    path: req.path,
    timestamp: new Date().toISOString()
  });
});

// Simple profile route (mock for now)
router.get('/profile', (req, res) => {
  console.log('✅ User profile route accessed');
  res.json({ 
    success: true, 
    message: 'User profile endpoint working!', 
    path: req.path,
    timestamp: new Date().toISOString(),
    // Return user data in the format expected by frontend
    id: 'mock-user-id-123',
    email: 'user@example.com',
    firstName: 'John',
    lastName: 'Doe', 
    fullName: 'John Doe',
    role: 'user',
    avatar: 'https://via.placeholder.com/150',
    bio: 'This is a mock user profile for testing purposes.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.com',
    socialLinks: {
      twitter: '@johndoe',
      linkedin: 'johndoe',
      github: 'johndoe'
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
});

// Export the router
export const userRouterSimple = router;

console.log('✅ Simple user routes exported');
