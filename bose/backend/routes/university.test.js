/**
 * University Module Tests
 * Tests for all university API endpoints
 * 
 * Run with: npm test -- university.test.js
 * or: jest university.test.js
 */

import request from 'supertest';
import express from 'express';
import Joi from 'joi';
import { requireUniversity } from '../middleware/roleMiddleware.js';
import universityRouter from './university.js';
import jwt from 'jsonwebtoken';

// ==================== TEST SETUP ====================

/**
 * Create test Express app with university routes
 */
function createTestApp() {
  const app = express();
  
  app.use(express.json());
  
  // Mock auth middleware for tests
  app.use((req, res, next) => {
    // For tests, extract token from Authorization header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const jwtSecret = process.env.JWT_SECRET || 'insecure-demo-secret';
        const user = jwt.verify(token, jwtSecret);
        req.user = user;
      } catch (err) {
        return res.status(403).json({ error: 'Invalid token' });
      }
    }
    next();
  });
  
  app.use('/api/university', universityRouter);
  
  return app;
}

/**
 * Create mock JWT token for testing
 */
function createToken(payload = {}) {
  const defaultPayload = {
    userId: 'test_user_001',
    email: 'test@university.com',
    role: 'university',
    organization: 'Test University',
    ...payload
  };
  
  const jwtSecret = process.env.JWT_SECRET || 'insecure-demo-secret';
  return jwt.sign(defaultPayload, jwtSecret, { expiresIn: '1h' });
}

/**
 * Create mock token for non-university role
 */
function createInvalidRoleToken() {
  return createToken({ role: 'student' });
}

// ==================== TEST SUITES ====================

describe('University Module API Tests', () => {
  let app;
  let token;

  beforeEach(() => {
    app = createTestApp();
    token = createToken();
  });

  // ==================== VERIFICATION REQUESTS TESTS ====================

  describe('GET /api/university/verification/requests', () => {
    test('should return pending verification requests with authentication', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(10);
    });

    test('should return 401 without authentication', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });

    test('should return 403 for non-university role', async () => {
      const invalidToken = createInvalidRoleToken();
      const res = await request(app)
        .get('/api/university/verification/requests')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(res.body.error).toBeDefined();
    });

    test('should filter by status parameter', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests?status=pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.every(vr => vr.status === 'pending')).toBe(true);
    });

    test('should handle pagination', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
    });

    test('should reject invalid page number', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests?page=0')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== APPROVE CREDENTIAL TESTS ====================

  describe('POST /api/university/verification/approve/:requestId', () => {
    test('should approve a pending verification request', async () => {
      // First, get a pending request
      const listRes = await request(app)
        .get('/api/university/verification/requests?status=pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const pendingRequest = listRes.body.data[0];
      expect(pendingRequest).toBeDefined();

      // Approve it
      const res = await request(app)
        .post(`/api/university/verification/approve/${pendingRequest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.verificationRequest.status).toBe('approved');
      expect(res.body.issuedCredential).toBeDefined();
      expect(res.body.hash).toBeDefined();
      expect(res.body.timestamp).toBeDefined();
    });

    test('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .post('/api/university/verification/approve/INVALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    test('should generate SHA256 hash for credential', async () => {
      const listRes = await request(app)
        .get('/api/university/verification/requests?status=pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const pendingRequest = listRes.body.data[0];

      const res = await request(app)
        .post(`/api/university/verification/approve/${pendingRequest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          fileUrl: 'https://example.com/credential.pdf',
          timestamp: new Date().toISOString()
        })
        .expect(200);

      expect(res.body.hash).toBeDefined();
      expect(res.body.hash.length).toBe(64); // SHA256 hex = 64 chars
      expect(/^[a-f0-9]{64}$/.test(res.body.hash)).toBe(true);
    });

    test('should reject approval of already approved request', async () => {
      const listRes = await request(app)
        .get('/api/university/verification/requests?status=approved')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const approvedRequest = listRes.body.data[0];
      
      if (approvedRequest) {
        const res = await request(app)
          .post(`/api/university/verification/approve/${approvedRequest._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({})
          .expect(400);

        expect(res.body.error).toContain('already');
        expect(res.body.currentStatus).toBe('approved');
      }
    });

    test('should return 403 for non-university role', async () => {
      const invalidToken = createInvalidRoleToken();
      const res = await request(app)
        .post('/api/university/verification/approve/VR-001')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({})
        .expect(403);

      expect(res.body.error).toBeDefined();
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .post('/api/university/verification/approve/VR-001')
        .send({})
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== REJECT CREDENTIAL TESTS ====================

  describe('POST /api/university/verification/reject/:requestId', () => {
    test('should reject a pending verification request', async () => {
      const listRes = await request(app)
        .get('/api/university/verification/requests?status=pending')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const pendingRequest = listRes.body.data[0];
      expect(pendingRequest).toBeDefined();

      const res = await request(app)
        .post(`/api/university/verification/reject/${pendingRequest._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Document does not meet verification standards' })
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.verificationRequest.status).toBe('rejected');
      expect(res.body.verificationRequest.rejectionReason).toBe('Document does not meet verification standards');
    });

    test('should return 400 for missing rejection reason', async () => {
      const res = await request(app)
        .post('/api/university/verification/reject/VR-001')
        .set('Authorization', `Bearer ${token}`)
        .send({})
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    test('should return 400 for reason shorter than 5 characters', async () => {
      const res = await request(app)
        .post('/api/university/verification/reject/VR-001')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Bad' })
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    test('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .post('/api/university/verification/reject/INVALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .send({ reason: 'Document does not meet standards' })
        .expect(404);

      expect(res.body.error).toBeDefined();
    });

    test('should reject rejection of already rejected request', async () => {
      const listRes = await request(app)
        .get('/api/university/verification/requests?status=rejected')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const rejectedRequest = listRes.body.data[0];
      
      if (rejectedRequest) {
        const res = await request(app)
          .post(`/api/university/verification/reject/${rejectedRequest._id}`)
          .set('Authorization', `Bearer ${token}`)
          .send({ reason: 'Already rejected' })
          .expect(400);

        expect(res.body.error).toContain('already');
      }
    });

    test('should return 403 for non-university role', async () => {
      const invalidToken = createInvalidRoleToken();
      const res = await request(app)
        .post('/api/university/verification/reject/VR-001')
        .set('Authorization', `Bearer ${invalidToken}`)
        .send({ reason: 'Document does not meet standards' })
        .expect(403);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== ISSUED CREDENTIALS TESTS ====================

  describe('GET /api/university/credentials/issued', () => {
    test('should return list of issued credentials', async () => {
      const res = await request(app)
        .get('/api/university/credentials/issued')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('should support pagination', async () => {
      const res = await request(app)
        .get('/api/university/credentials/issued?page=1&limit=2')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.data.length).toBeLessThanOrEqual(2);
      expect(res.body.pagination.limit).toBe(2);
    });

    test('should filter by credential type', async () => {
      const res = await request(app)
        .get('/api/university/credentials/issued?type=Degree')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      if (res.body.data.length > 0) {
        expect(res.body.data.every(ic => ic.credentialType === 'Degree')).toBe(true);
      }
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/university/credentials/issued')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== STUDENT SEARCH TESTS ====================

  describe('GET /api/university/students/search', () => {
    test('should return list of students', async () => {
      const res = await request(app)
        .get('/api/university/students/search')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.pagination).toBeDefined();
    });

    test('should search students by name', async () => {
      const res = await request(app)
        .get('/api/university/students/search?name=Sarah')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data.every(s => 
          s.name.toLowerCase().includes('sarah')
        )).toBe(true);
      }
    });

    test('should search students by email', async () => {
      const res = await request(app)
        .get('/api/university/students/search?email=sarah')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data.every(s => 
          s.email.toLowerCase().includes('sarah')
        )).toBe(true);
      }
    });

    test('should search students by degree', async () => {
      const res = await request(app)
        .get('/api/university/students/search?degree=Computer')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data.every(s => 
          s.degree.toLowerCase().includes('computer')
        )).toBe(true);
      }
    });

    test('should include credential summary in response', async () => {
      const res = await request(app)
        .get('/api/university/students/search')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      if (res.body.data.length > 0) {
        expect(res.body.data[0].credentialSummary).toBeDefined();
        expect(res.body.data[0].credentialSummary.issuedCount).toBeDefined();
        expect(res.body.data[0].credentialSummary.pendingCount).toBeDefined();
      }
    });

    test('should return 400 for invalid email format', async () => {
      const res = await request(app)
        .get('/api/university/students/search?email=invalid-email')
        .set('Authorization', `Bearer ${token}`)
        .expect(400);

      expect(res.body.error).toBeDefined();
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/university/students/search')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== ANALYTICS TESTS ====================

  describe('GET /api/university/reports/analytics', () => {
    test('should return analytics dashboard data', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.analytics).toBeDefined();
      expect(res.body.analytics.summary).toBeDefined();
      expect(res.body.analytics.credentialBreakdown).toBeDefined();
      expect(res.body.analytics.monthlyVerifications).toBeDefined();
      expect(res.body.analytics.recentActivity).toBeDefined();
    });

    test('should include required summary metrics', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { summary } = res.body.analytics;
      expect(summary.totalPending).toBeGreaterThanOrEqual(0);
      expect(summary.totalApproved).toBeGreaterThanOrEqual(0);
      expect(summary.totalRejected).toBeGreaterThanOrEqual(0);
      expect(summary.totalIssued).toBeGreaterThanOrEqual(0);
      expect(typeof summary.averageVerificationTimeMinutes).toBe('number');
    });

    test('should include credential breakdown', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { credentialBreakdown } = res.body.analytics;
      expect(credentialBreakdown.byType).toBeDefined();
      expect(credentialBreakdown.byStatus).toBeDefined();
      expect(credentialBreakdown.byStatus.verified).toBeGreaterThanOrEqual(0);
      expect(credentialBreakdown.byStatus.pending).toBeGreaterThanOrEqual(0);
      expect(credentialBreakdown.byStatus.rejected).toBeGreaterThanOrEqual(0);
    });

    test('should include monthly statistics', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { monthlyVerifications } = res.body.analytics;
      expect(Object.keys(monthlyVerifications).length).toBeGreaterThanOrEqual(0);
    });

    test('should include recent activity', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const { recentActivity } = res.body.analytics;
      expect(Array.isArray(recentActivity.recentRequests)).toBe(true);
      expect(Array.isArray(recentActivity.recentCredentials)).toBe(true);
    });

    test('should return 403 for non-university role', async () => {
      const invalidToken = createInvalidRoleToken();
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(403);

      expect(res.body.error).toBeDefined();
    });

    test('should require authentication', async () => {
      const res = await request(app)
        .get('/api/university/reports/analytics')
        .expect(401);

      expect(res.body.error).toBeDefined();
    });
  });

  // ==================== DETAIL ENDPOINTS TESTS ====================

  describe('GET /api/university/verification/requests/:requestId', () => {
    test('should return specific verification request', async () => {
      const listRes = await request(app)
        .get('/api/university/verification/requests')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      const request_id = listRes.body.data[0]._id;

      const res = await request(app)
        .get(`/api/university/verification/requests/${request_id}`)
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(res.body.success).toBe(true);
      expect(res.body.data._id).toBe(request_id);
    });

    test('should return 404 for non-existent request', async () => {
      const res = await request(app)
        .get('/api/university/verification/requests/INVALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/university/credentials/issued/:credentialId', () => {
    test('should return specific issued credential', async () => {
      const listRes = await request(app)
        .get('/api/university/credentials/issued')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      if (listRes.body.data.length > 0) {
        const credential_id = listRes.body.data[0]._id;

        const res = await request(app)
          .get(`/api/university/credentials/issued/${credential_id}`)
          .set('Authorization', `Bearer ${token}`)
          .expect(200);

        expect(res.body.success).toBe(true);
        expect(res.body.data._id).toBe(credential_id);
      }
    });

    test('should return 404 for non-existent credential', async () => {
      const res = await request(app)
        .get('/api/university/credentials/issued/INVALID-ID')
        .set('Authorization', `Bearer ${token}`)
        .expect(404);

      expect(res.body.error).toBeDefined();
    });
  });
});

// ==================== EXPORT FOR MODULE TESTING ====================

export { createTestApp, createToken, createInvalidRoleToken };