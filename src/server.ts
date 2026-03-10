import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

// Import background tasks
import { startCronJobs } from './tasks/ticketExpiration';

// Load environment variables
dotenv.config();

const app = express();

// ============================================
// PRODUCTION OPTIMIZATIONS
// ============================================

// 1. Enable gzip compression (mentioned in DEPLOYMENT.md)
app.use(compression());

// 2. Configure CORS based on environment
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);

    // In development or if explicitly allowed, permit all
    if (process.env.NODE_ENV !== 'production' || process.env.ALLOW_ALL_ORIGINS === 'true') {
      return callback(null, true);
    }

    const allowedOrigins = [
      process.env.FRONTEND_URL,
      'https://campus-event-api.vercel.app',
      'http://localhost:3000',
      'http://localhost:5173'
    ].filter(Boolean) as string[];

    // Check if origin matches any allowed origin or Vercel preview URL
    const isAllowed = allowedOrigins.some(o => origin === o) ||
                      origin.endsWith('.vercel.app');

    if (!isAllowed) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  optionsSuccessStatus: 200
}));

// 3. Rate limiting (mentioned in DEPLOYMENT.md)
// General API limiter
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Stricter limiter for auth endpoints (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login/register attempts per 15 minutes
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again after 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use('/api/', apiLimiter); // Apply to all API routes
app.use('/api/auth/login', authLimiter); // Stricter for login
app.use('/api/auth/register', authLimiter); // Stricter for register

// ============================================
// SECURITY & LOGGING
// ============================================

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    },
  },
}));

// Logging (with environment awareness)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Production logging - less verbose but includes useful info
  app.use(morgan('combined', {
    skip: (req, res) => res.statusCode < 400 // Skip successful requests in production logs
  }));
}

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============================================
// EXISTING ROUTES (keep your current routes)
// ============================================

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// API Routes
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import ticketRoutes from './routes/ticketRoutes';

// seed logic (moved into src so compilation includes it)
import { seedDatabase } from './scripts/seedDatabase';

// convenience seed endpoint - only enabled when explicitly allowed
// Usage: set ENABLE_SEED=true (or run locally) then GET /api/seed
if (process.env.ENABLE_SEED === 'true') {
  app.get('/api/seed', async (_req, res) => {
    try {
      await seedDatabase();
      res.json({ message: 'Database seeded' });
    } catch (err) {
      console.error('Seed error', err);
      res.status(500).json({ error: 'Seeding failed', details: err });
    }
  });
}

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

const PORT = process.env.PORT || 5000;

// Root endpoint with API documentation
app.get('/', (req, res) => {
  const baseUrl = process.env.NODE_ENV === 'production'
    ? process.env.BACKEND_URL || 'https://campus-event-api-izni.onrender.com'
    : `http://localhost:${PORT}`;

  res.json({
    success: true,
    message: '🎫 CampusEvent API',
    version: '1.0.0',
    environment: process.env.NODE_ENV,
    endpoints: {
      health: `${baseUrl}/health`,
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      events: {
        getAll: 'GET /api/events',
        create: 'POST /api/events (protected)'
      },
      tickets: {
        purchase: 'POST /api/tickets/purchase (protected)',
        getUserTickets: 'GET /api/tickets/user/:userId (protected)'
      }
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);

  // Don't leak error details in production
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : err.message;

  res.status(500).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ============================================
// SERVER STARTUP
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-event-api';

const startServer = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Start background tasks
    startCronJobs();

    app.listen(Number(PORT), () => {
      console.log(`
🚀 Server running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
🔒 Security: Helmet, CORS, Rate limiting enabled
📦 Compression: Gzip enabled
📚 Health check: http://localhost:${PORT}/health
      `);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;