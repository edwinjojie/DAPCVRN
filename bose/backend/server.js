import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import dotenv from 'dotenv';

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
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
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

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    network: 'Hyperledger Fabric v2.5',
    channel: process.env.FABRIC_CHANNEL_NAME,
    chaincode: process.env.FABRIC_CHAINCODE_NAME
  });
});

// Error handling
app.use(errorHandler);

// Initialize demo data on startup
initializeDemoData().catch(console.error);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🚀 BOSE Backend Server running on port ${PORT}`);
  console.log(`📊 WebSocket Server ready for real-time events`);
  console.log(`🔗 Hyperledger Fabric Network: ${process.env.FABRIC_CHANNEL_NAME}`);
});

export { wss };