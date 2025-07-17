import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import { initializeAuth, authRoutes } from './modules/auth/index.js';
import investorRoutes from './routes/investors.js';
import propertyRoutes from './routes/properties.js';

const app = express();

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

// Routes
app.use('/auth', authRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/properties', propertyRoutes);

export default app;

