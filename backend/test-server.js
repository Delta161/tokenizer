/**
 * Simple test server to verify user routes
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), './.env') });

// Core Express imports
import express from 'express';
import cors from 'cors';

// Create Express application
const app = express();

// Basic middleware
app.use(cors({ 
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true 
}));
app.use(express.json());

// Test routes
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// User test routes
app.get('/api/v1/users/test', (req, res) => {
  res.json({ success: true, message: 'User test route working!', path: req.path });
});

app.get('/api/v1/users/profile', (req, res) => {
  res.json({ success: true, message: 'User profile route working!', path: req.path });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: `Not Found - ${req.path}`, 
    errorCode: 'NOT_FOUND' 
  });
});

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
const server = app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
  console.log(`API available at http://localhost:${PORT}/api/v1`);
});

export default app;
