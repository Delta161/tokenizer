import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import { initializeAuth, authRouter as authRoutes } from './src/modules/accounts/index.js';
import { createInvestorRoutes } from './src/modules/investor/index.js';
import { initBlockchainModule } from './src/modules/blockchain/index.js';
// Token and KYC modules have been migrated to the new structure
import { createTokenRoutes } from './src/modules/token/index.js';
import { initKycModule } from './src/modules/accounts/index.js';
import { initNotificationModule, mountNotificationRoutes } from './src/modules/notifications/index.js';
import { initAdminModule } from './src/modules/admin/index.js';
import { initDocumentModule, mountDocumentRoutes } from './src/modules/documents/index.js';
import { initAnalyticsModule } from './src/modules/analytics/index.js';

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
const blockchainModule = initBlockchainModule();
const kycModule = initKycModule(prisma);
const notificationModule = initNotificationModule(prisma);
const documentModule = initDocumentModule(prisma);
const analyticsModule = initAnalyticsModule(prisma);

// Initialize admin module with Prisma client and notification trigger
const adminModule = initAdminModule(prisma, notificationModule.trigger);

// Routes
app.use('/auth', authRoutes);
app.use('/api/investors', createInvestorRoutes());
app.use('/api/blockchain', blockchainModule);
// Token and KYC routes have been migrated to the new structure
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

// Analytics routes (includes audit and flags)
app.use('/api/analytics/audit', analyticsModule.auditRouter);
app.use('/api/analytics/flags', analyticsModule.flagsRouter);

export default app;

