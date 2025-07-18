import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { initializeAuth, authRoutes } from './modules/auth/index.js';
import investorRoutes from './routes/investors.js';
import propertyRoutes from './routes/properties.js';
import { initSmartContractModule } from './modules/smart-contract/index.js';
import { createTokenRoutes } from './modules/token/index.js';
import { initKycModule } from './modules/kyc/index.js';
import { initNotificationModule, mountNotificationRoutes } from './modules/notifications/index.js';
import { initAdminModule } from './modules/admin/index.js';
import { initDocumentModule, mountDocumentRoutes } from './modules/documents/index.js';
import { auditRouter } from './modules/audit/index.ts';

const app = express();

// Initialize Prisma client
const prisma = new PrismaClient();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware (minimal for OAuth flows)
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Initialize authentication module
initializeAuth();

// Initialize modules
const smartContractModule = initSmartContractModule(prisma);
const kycModule = initKycModule(prisma);
const notificationModule = initNotificationModule(prisma);
const documentModule = initDocumentModule(prisma);

// Initialize admin module with Prisma client and notification trigger
const adminModule = initAdminModule(prisma, notificationModule.trigger);

// Routes
app.use('/auth', authRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/smart-contract', smartContractModule.routes);
app.use('/api', createTokenRoutes(prisma));
app.use('/api/kyc', kycModule.routes);

// KYC Provider routes
app.use('/api/kyc/provider', kycModule.providerRoutes);

// KYC Webhook routes (no auth middleware)
app.use('/api/kyc/webhook', kycModule.webhookRoutes);

// Notification routes
mountNotificationRoutes(app, notificationModule.controller, '/api/notifications');

// Document routes
mountDocumentRoutes(app, documentModule.routes, '/api/documents');

// Admin routes
app.use('/api/admin', adminModule);

// Audit routes
app.use('/api', auditRouter);

export default app;

