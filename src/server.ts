import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';

// Import routes
import authRoutes from './routes/authRoutes';
import eventRoutes from './routes/eventRoutes';
import ticketRoutes from './routes/ticketRoutes';

// Import background tasks
import { startCronJobs } from './tasks/ticketExpiration';
import { version } from 'os';
import { get } from 'http';
import { uptime } from 'process';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  const morgan = require('morgan');
  app.use(morgan('dev'));
}

app.get('/', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Welcome to CampusEvent API! 🎫Campus Event API is running',
    version: '1.0.0',
    documentation: 'https://github.com/ItzJoeCode/campus-event-api',
    endpoints: {
      health: 'Get /health',
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      events: {
        getAll: 'GET /api/events',
        create: 'POST /api/events'
      },
      tickets: {
        purchase: 'POST /api/tickets/purchase',
        getUserTickets: 'GET /api/tickets/user/:userId'
      }
    },
    status: 'API is operational 🚀✅',
    uptime: process.uptime()
  });
});

// Health check endpoint
app.get('/health', (req: express.Request, res: express.Response) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'CampusEvent-API',
    database: dbStatus,
    message: 'Server is fully operational'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/tickets', ticketRoutes);

// 404 handler
app.use((req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/campus-event-api';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    
    // Start background tasks
    startCronJobs();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📚 Health check: http://localhost:${PORT}/health`);
      console.log(`🔐 Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`🎫 Event endpoints: http://localhost:${PORT}/api/events`);
      console.log(`🎟️ Ticket endpoints: http://localhost:${PORT}/api/tickets`);
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;