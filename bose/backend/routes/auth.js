import express from 'express';
import bcrypt from 'bcryptjs';
import { User, Organization } from '../models/index.js';

const router = express.Router();

// Handle preflight requests for CORS
router.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, x-user-id, x-user-role, x-user-email, x-user-org');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// ── POST /api/auth/login ────────────────────────────────────────────────────
// Verifies email + password against MongoDB. Returns plain user object.
// No JWT generated – the frontend stores the user data in localStorage directly.
router.post('/login', async (req, res) => {
  try {
    console.log('Login attempt for:', req.body.email);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).lean();
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if user is banned
    if (user.status === 'banned') {
      return res.status(403).json({ error: 'Your account has been banned. Please contact support.' });
    }

    // Verify password using bcrypt
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log('Login successful:', email, '| role:', user.role);

    // Return user data – frontend stores this in localStorage, no token needed
    res.json({
      user: {
        id:           user._id.toString(),
        email:        user.email,
        name:         user.name,
        role:         user.role,
        organization: user.organizationId || user.organization || ''
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ── GET /api/auth/me ────────────────────────────────────────────────────────
// Returns user data from x-user-id header (set by frontend after login).
router.get('/me', async (req, res) => {
  const userId = req.headers['x-user-id'];

  if (!userId) {
    return res.status(400).json({ error: 'x-user-id header required' });
  }

  try {
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      user: {
        id:           user._id.toString(),
        email:        user.email,
        name:         user.name,
        role:         user.role,
        organization: user.organizationId || user.organization || ''
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Failed to retrieve user' });
  }
});

// ── GET /api/auth/organizations ─────────────────────────────────────────────
router.get('/organizations', async (req, res) => {
  try {
    const orgs = await Organization.find({ isApproved: true })
      .select('organizationId name type mspId description logo')
      .lean();
    res.json(orgs);
  } catch (error) {
    console.error('Error fetching organizations:', error);
    res.status(500).json({ error: 'Failed to fetch organizations' });
  }
});

export default router;