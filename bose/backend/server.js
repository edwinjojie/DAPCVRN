import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

// Database
import database from './config/database.js';

import authRoutes from './routes/auth.js';
// Routes
import analyticsRoutes from './routes/analytics.js';
import eventRoutes from './routes/events.js';
import recruiterRoutes from './routes/recruiter.js';
import jobsRoutes from './routes/jobs.js';
import applicantsRouter from './routes/applicants.js';
import candidatesRouter from './routes/candidates.js';
import messagesRouter from './routes/messages.js';
import notificationsRouter from './routes/notifications.js';
import candidateRouter from './routes/candidate.js';
import candidateProfileRouter from './routes/candidateProfile.js';
import credentialsRouter from './routes/credentials.js';
import applicationsRouter from './routes/applications.js';
import { authenticateToken } from './middleware/auth.js';
import { initializeDemoData } from './services/demoData.js';
import { setupWebSocket } from './services/websocket.js';
import { errorHandler } from './middleware/errorHandler.js';
import adminRouter from './routes/admin.js';
import institutionsRouter from './routes/institutions.js';
import universityRouter from './routes/university.js';
import ratingsRouter from './routes/ratings.js';
import publicRouter from './routes/public.js';
// Blockchain routes
import certificateRouter from './routes/certificate.js';
import skillsRouter from './routes/skills.js';
// AI Recommendation routes
import aiRouter from './routes/recommendations.js';
import path from 'path';

dotenv.config();

// Ensure development mode for CORS
if (!process.env.NODE_ENV) {
  process.env.NODE_ENV = 'development';
}

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Security and performance middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));
app.use(compression());
// CORS configuration for development and port forwarding
const corsOptions = {
  origin: function (origin, callback) {
    console.log('CORS request from origin:', origin);

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      console.log('No origin provided, allowing request');
      return callback(null, true);
    }

    // Allow localhost development
    const localhostRegex = /^https?:\/\/localhost(:\d+)?$/;
    if (localhostRegex.test(origin)) {
      console.log('Localhost origin allowed:', origin);
      return callback(null, true);
    }

    // Allow dev tunnels and port forwarding
    const devTunnelRegex = /^https?:\/\/.*\.devtunnels\.ms$/;
    const portForwardRegex = /^https?:\/\/.*\.inc1\.devtunnels\.ms$/;
    if (devTunnelRegex.test(origin) || portForwardRegex.test(origin)) {
      console.log('Dev tunnel origin allowed:', origin);
      return callback(null, true);
    }

    // Allow specific localhost ports for development
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:5174',
      'http://127.0.0.1:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174'
    ];

    if (allowedOrigins.includes(origin)) {
      console.log('Allowed origin:', origin);
      return callback(null, true);
    }

    // For development, allow all origins (less secure but works for dev)
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
      console.log('Development mode - allowing all origins:', origin);
      return callback(null, true);
    }

    console.log('Origin not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-user-id', 'x-user-role', 'x-user-email', 'x-user-org'],
  optionsSuccessStatus: 200 // For legacy browser support
};

app.use(cors(corsOptions));


// Rate limiting (relaxed in development and for auth routes)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 100000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  skip: (req) => {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    const isAuthRoute = req.path.startsWith('/api/auth');
    return isDev || isAuthRoute;
  }
});
app.use('/api/', limiter);

app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// WebSocket setup
setupWebSocket(wss);

// Routes
app.use('/api/auth', authRoutes);

// Public routes
app.use('/api/public/jobs', jobsRoutes); // Public job browsing → GET /api/public/jobs
app.use('/api/public', publicRouter);    // Public profile viewing

// All routes – open (no JWT required; user identity passed via x-user-* headers)
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/events', authenticateToken, eventRoutes);
app.use('/api/recruiter', authenticateToken, recruiterRoutes);
app.use('/api/jobs', authenticateToken, jobsRoutes);
app.use('/api/applicants', authenticateToken, applicantsRouter);
app.use('/api/candidates', authenticateToken, candidatesRouter);
app.use('/api/messages', authenticateToken, messagesRouter);
app.use('/api/notifications', authenticateToken, notificationsRouter);
app.use('/api/admin', authenticateToken, adminRouter);
app.use('/api/institutions', authenticateToken, institutionsRouter);
app.use('/api/candidate', authenticateToken, candidateRouter);
app.use('/api/candidate/profile', authenticateToken, candidateProfileRouter);
app.use('/api/credentials', authenticateToken, credentialsRouter);
app.use('/api/applications', authenticateToken, applicationsRouter);
app.use('/api/university', authenticateToken, universityRouter);
app.use('/api/ratings', authenticateToken, ratingsRouter);

// AI Recommendation routes
app.use('/api/ai', authenticateToken, aiRouter);

// Blockchain routes (now authenticated)
app.use('/api/certificate', authenticateToken, certificateRouter);
app.use('/api/skill', authenticateToken, skillsRouter);


// Serve uploaded files (credentials) - development only
app.use('/uploads', express.static(path.join(process.cwd(), 'backend', 'uploads')));

// Health check
app.get('/api/health', (req, res) => {
  const dbStatus = database.isConnected() ? 'connected' : 'disconnected';

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    blockchainRoutes: [
      'POST /api/certificate/upload',
      'POST /api/certificate/approve/:certId',
      'POST /api/certificate/verify',
      'GET  /api/certificate/:certId',
      'POST /api/skill/add',
      'GET  /api/skill/:skillId'
    ],
    network: 'Hyperledger Fabric v2.5',
    channel: process.env.FABRIC_CHANNEL || 'mychannel',
    chaincode: process.env.FABRIC_CHAINCODE_ID || 'bose'
  });
});

// Error handling
app.use(errorHandler);

// Initialize server
const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Connect to MongoDB (non-blocking in development)
    try {
      await database.connect();
    } catch (dbError) {
      console.warn('⚠️  MongoDB connection failed - running in mock data mode');
      console.warn('💡 To fix: Add your IP to MongoDB Atlas Network Access whitelist');
      console.warn('   Visit: https://cloud.mongodb.com/ > Network Access > Add IP Address');
    }

    // Initialize demo data on startup
    await initializeDemoData();

    // Start server
    server.listen(PORT, () => {
      // Make wss available globally for WebSocket broadcasts from routes
      global.wss = wss;
      console.log(`🚀 BOSE Backend Server running on port ${PORT}`);
      console.log(`📊 WebSocket Server ready for real-time events`);
      console.log(`🔗 Hyperledger Fabric Network: ${process.env.FABRIC_CHANNEL}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

export { wss };