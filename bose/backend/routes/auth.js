import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = express.Router();

// Handle preflight requests for CORS
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Mock user database (in production, use proper database)
const mockUsers = {
  'student@example.com': {
    id: 'user_001',
    email: 'student@example.com',
    password: '$2a$10$mockhashedpassword',
    role: 'student',
    name: 'John Student',
    organization: 'Students'
  },
  'employer@org1.com': {
    id: 'user_002',
    email: 'employer@org1.com',
    password: '$2a$10$mockhashedpassword',
    role: 'employer',
    name: 'Jane Employer',
    organization: 'Org1MSP'
  },
  'verifier@org2.com': {
    id: 'user_003',
    email: 'verifier@org2.com',
    password: '$2a$10$mockhashedpassword',
    role: 'verifier',
    name: 'Bob Verifier',
    organization: 'Org2MSP'
  },
  'auditor@ministry.com': {
    id: 'user_004',
    email: 'auditor@ministry.com',
    password: '$2a$10$mockhashedpassword',
    role: 'auditor',
    name: 'Alice Auditor',
    organization: 'Org3MSP'
  },
  // Added mock users with explicit roles for admin, institution, employer
  'admin@dapcvrn.com': {
    id: 'user_admin',
    email: 'admin@dapcvrn.com',
    password: '$2a$10$mockhashedpassword',
    role: 'admin',
    name: 'System Admin',
    organization: 'BOSE'
  },
  'iit@dapcvrn.com': {
    id: 'user_inst',
    email: 'iit@dapcvrn.com',
    password: '$2a$10$mockhashedpassword',
    role: 'institution',
    name: 'IIT Issuer',
    organization: 'IITMSP'
  },
  'hr@dapcvrn.com': {
    id: 'user_emp',
    email: 'hr@dapcvrn.com',
    password: '$2a$10$mockhashedpassword',
    role: 'employer',
    name: 'HR Manager',
    organization: 'AcmeCorp'
  }
};

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    console.log('Login request received from origin:', req.headers.origin);
    console.log('Request headers:', req.headers);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user (in production, query from database)
    const user = mockUsers[email];
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // For demo purposes, accept any password (in production, use bcrypt.compare)
    const validPassword = true; // await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'insecure-demo-secret';
    const token = jwt.sign(
      { 
        userId: user.id,
        email: user.email,
        role: user.role,
        organization: user.organization
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwtSecret = process.env.JWT_SECRET || 'insecure-demo-secret';
    const decoded = jwt.verify(token, jwtSecret);
    const user = mockUsers[decoded.email];
    
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        organization: user.organization
      }
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Mock organizations data
router.get('/organizations', (req, res) => {
  res.json([
    {
      id: 'org1',
      name: 'University ABC',
      mspId: 'Org1MSP',
      type: 'issuer',
      description: 'Leading educational institution'
    },
    {
      id: 'org2',
      name: 'TechCorp Verifiers',
      mspId: 'Org2MSP',
      type: 'verifier',
      description: 'Corporate credential verification'
    },
    {
      id: 'org3',
      name: 'Education Ministry',
      mspId: 'Org3MSP',
      type: 'auditor',
      description: 'Government oversight and compliance'
    }
  ]);
});

export default router;