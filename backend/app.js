import express from 'express';
import passport from 'passport';
import session from 'express-session';
import './config/passport.js';
import authRoutes from './routes/auth.routes.js';
import investorRoutes from './routes/investors.js';
import propertyRoutes from './routes/properties.js';

const app = express();

// Middleware for parsing JSON and form data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use('/auth', authRoutes);
app.use('/api/investors', investorRoutes);
app.use('/api/properties', propertyRoutes);

export default app;

