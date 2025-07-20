import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { initializeAuth, authRoutes } from './src/modules/auth/index.js';
import propertyRoutes from './routes/properties.js';
import { initSmartContractModule } from './src/modules/smart-contract/index.js';
// Token module has been migrated to the new structure
import { initKycModule } from './src/modules/kyc/index.js';
import { initNotificationModule, mountNotificationRoutes } from './src/modules/notifications/index.js';
import { initAdminModule } from './src/modules/admin/index.js';
import { initDocumentModule, mountDocumentRoutes } from './src/modules/documents/index.js';
import { auditRouter } from './src/modules/audit/index.ts';
import { flagsRoutes } from './src/modules/flags/index.js';

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
app.use('/api/properties', propertyRoutes);
app.use('/api/smart-contract', smartContractModule.routes);
// Token routes have been migrated to the new structure
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

// Feature Flags routes
app.use('/api', flagsRoutes);

export default app;

