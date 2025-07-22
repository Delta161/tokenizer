import express from 'express';
import passport from 'passport';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { BearerStrategy } from 'passport-azure-ad';
import jwt from 'jsonwebtoken';

// Load environment variables
dotenv.config();

const app = express();

// CORS configuration
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Session middleware
app.use(session({
  secret: process.env.JWT_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set to true in production with HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Passport serialization
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Google OAuth Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/accounts/auth/google/callback'
  }, (accessToken, refreshToken, profile, done) => {
    const user = {
      id: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      profileImage: profile.photos[0]?.value
    };
    return done(null, user);
  }));
}

// Azure OAuth Strategy (if configured)
if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
  passport.use(new BearerStrategy({
    identityMetadata: `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/v2.0/.well-known/openid_configuration`,
    clientID: process.env.AZURE_CLIENT_ID,
    validateIssuer: false,
    loggingLevel: 'info',
    passReqToCallback: false
  }, (token, done) => {
    const user = {
      id: token.oid,
      email: token.preferred_username,
      name: token.name,
      provider: 'azure'
    };
    return done(null, user);
  }));
}

// Helper function to generate JWT
function generateJWT(user) {
  return jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      name: user.name,
      provider: user.provider 
    },
    process.env.JWT_SECRET || 'your-secret-key',
    { expiresIn: '24h' }
  );
}

// OAuth Routes
app.get('/accounts/auth/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

app.get('/accounts/auth/google/callback',
  passport.authenticate('google', { failureRedirect: '/accounts/auth/error' }),
  (req, res) => {
    try {
      const token = generateJWT(req.user);
      
      // Set JWT as HTTP-only cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: false, // Set to true in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });
      
      // Redirect to frontend callback
      res.redirect('http://localhost:5173/callback?success=true');
    } catch (error) {
      console.error('OAuth success error:', error);
      res.redirect('http://localhost:5173/callback?error=server_error');
    }
  }
);

app.get('/accounts/auth/azure',
  passport.authenticate('oauth-bearer', { session: false })
);

app.get('/accounts/auth/azure/callback', (req, res) => {
  // Azure callback handling
  res.redirect('http://localhost:5173/callback?success=true');
});

app.get('/accounts/auth/error', (req, res) => {
  res.redirect('http://localhost:5173/callback?error=oauth_error');
});

// Profile endpoint
app.get('/accounts/auth/profile', (req, res) => {
  const token = req.cookies.token;
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    res.json({
      success: true,
      user: {
        id: decoded.id,
        email: decoded.email,
        name: decoded.name,
        provider: decoded.provider
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Logout endpoint
app.post('/accounts/auth/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

// Health check
app.get('/accounts/auth/health', (req, res) => {
  const providers = [];
  if (process.env.GOOGLE_CLIENT_ID) providers.push('google');
  if (process.env.AZURE_CLIENT_ID) providers.push('azure');
  
  res.json({
    status: 'ok',
    providers,
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'OAuth Server is running',
    endpoints: [
      '/accounts/auth/google',
      '/accounts/auth/azure', 
      '/accounts/auth/profile',
      '/accounts/auth/health'
    ]
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`OAuth Server running on port ${PORT}`);
  console.log(`Available at http://localhost:${PORT}`);
  console.log('OAuth endpoints:');
  console.log(`  Google: http://localhost:${PORT}/accounts/auth/google`);
  console.log(`  Azure: http://localhost:${PORT}/accounts/auth/azure`);
  console.log(`  Profile: http://localhost:${PORT}/accounts/auth/profile`);
  console.log(`  Health: http://localhost:${PORT}/accounts/auth/health`);
});