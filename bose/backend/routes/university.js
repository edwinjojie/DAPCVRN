import express from 'express';
import Joi from 'joi';
import { requireUniversity } from '../middleware/roleMiddleware.js';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

const router = express.Router();

// ==================== MOCK DATA ====================

/**
 * Mock Verification Requests
 * Represents credential verification requests from students
 */
let verificationRequests = [
  {
    _id: 'VR-001',
    studentId: 'student_001',
    studentName: 'Sarah Chen',
    studentEmail: 'sarah@example.com',
    credentialId: 'cred_001',
    credentialType: 'Degree',
    credentialTitle: 'B.Tech Computer Science',
    status: 'pending', // pending, approved, rejected
    reason: null,
    submittedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    rejectionReason: null,
  },
  {
    _id: 'VR-002',
    studentId: 'student_002',
    studentName: 'Michael Rodriguez',
    studentEmail: 'michael@example.com',
    credentialId: 'cred_002',
    credentialType: 'Certificate',
    credentialTitle: 'AWS Solutions Architect',
    status: 'pending',
    reason: null,
    submittedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    rejectionReason: null,
  },
  {
    _id: 'VR-003',
    studentId: 'student_003',
    studentName: 'Emily Watson',
    studentEmail: 'emily@example.com',
    credentialId: 'cred_003',
    credentialType: 'Degree',
    credentialTitle: 'M.Tech Data Science',
    status: 'approved',
    reason: null,
    submittedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    rejectionReason: null,
  },
  {
    _id: 'VR-004',
    studentId: 'student_004',
    studentName: 'James Park',
    studentEmail: 'james@example.com',
    credentialId: 'cred_004',
    credentialType: 'Certificate',
    credentialTitle: 'Google Cloud Associate',
    status: 'rejected',
    reason: null,
    submittedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    approvedAt: null,
    rejectionReason: 'Document does not meet verification standards',
  },
];

/**
 * Mock Issued Credentials
 * Credentials that have been verified by the university
 */
let issuedCredentials = [
  {
    _id: 'IC-001',
    studentId: 'student_001',
    studentName: 'Sarah Chen',
    credentialType: 'Degree',
    credentialTitle: 'B.Tech Computer Science',
    issuedBy: 'IIT Delhi',
    issuedDate: '2023-05-15',
    verifiedOn: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    hash: 'sha256_hash_001_example',
    status: 'verified',
  },
  {
    _id: 'IC-002',
    studentId: 'student_003',
    studentName: 'Emily Watson',
    credentialType: 'Degree',
    credentialTitle: 'M.Tech Data Science',
    issuedBy: 'IIT Mumbai',
    issuedDate: '2024-01-20',
    verifiedOn: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    hash: 'sha256_hash_002_example',
    status: 'verified',
  },
  {
    _id: 'IC-003',
    studentId: 'student_005',
    studentName: 'Lisa Zhang',
    credentialType: 'Certificate',
    credentialTitle: 'Blockchain Development',
    issuedBy: 'NIT Trichy',
    issuedDate: '2024-02-10',
    verifiedOn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    hash: 'sha256_hash_003_example',
    status: 'verified',
  },
];

/**
 * Mock Students Database
 * Minimal student profiles for university search
 */
let students = [
  {
    _id: 'student_001',
    name: 'Sarah Chen',
    email: 'sarah@example.com',
    degree: 'B.Tech Computer Science',
    enrollmentYear: 2020,
    credentialCount: 1,
  },
  {
    _id: 'student_002',
    name: 'Michael Rodriguez',
    email: 'michael@example.com',
    degree: 'B.Tech Electronics',
    enrollmentYear: 2021,
    credentialCount: 0,
  },
  {
    _id: 'student_003',
    name: 'Emily Watson',
    email: 'emily@example.com',
    degree: 'M.Tech Data Science',
    enrollmentYear: 2022,
    credentialCount: 1,
  },
  {
    _id: 'student_004',
    name: 'James Park',
    email: 'james@example.com',
    degree: 'B.Tech Mechanical',
    enrollmentYear: 2021,
    credentialCount: 0,
  },
  {
    _id: 'student_005',
    name: 'Lisa Zhang',
    email: 'lisa@example.com',
    degree: 'B.Tech Computer Science',
    enrollmentYear: 2020,
    credentialCount: 1,
  },
];

// ==================== VALIDATION SCHEMAS ====================

const approveCredentialSchema = Joi.object({
  fileUrl: Joi.string().uri().optional(),
  timestamp: Joi.date().optional(),
});

const rejectCredentialSchema = Joi.object({
  reason: Joi.string().min(5).max(500).required(),
});

const searchStudentsSchema = Joi.object({
  name: Joi.string().trim().optional(),
  email: Joi.string().email().optional(),
  degree: Joi.string().trim().optional(),
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});

// ==================== HELPER FUNCTIONS ====================

/**
 * Generate SHA256 hash for credential
 */
function generateCredentialHash(fileUrl, timestamp) {
  const data = `${fileUrl}${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

/**
 * Calculate average verification time
 */
function calculateAverageVerificationTime() {
  const approvedRequests = verificationRequests.filter(vr => vr.status === 'approved' && vr.approvedAt);
  
  if (approvedRequests.length === 0) return 0;

  const totalTime = approvedRequests.reduce((sum, vr) => {
    const submitted = new Date(vr.submittedAt);
    const approved = new Date(vr.approvedAt);
    return sum + (approved - submitted);
  }, 0);

  return Math.round(totalTime / approvedRequests.length / (1000 * 60)); // Convert to minutes
}

// ==================== ROUTES ====================

/**
 * GET /api/university/verification/requests
 * List pending verification requests with pagination and filtering
 */
router.get('/verification/requests', requireUniversity, (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { page, limit, status } = value;

    // Filter by status if provided
    let filtered = verificationRequests;
    if (status) {
      filtered = filtered.filter(vr => vr.status === status);
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedRequests = filtered.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedRequests,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching verification requests:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

/**
 * POST /api/university/verification/approve/:requestId
 * Approve a credential verification request
 */
router.post('/verification/approve/:requestId', requireUniversity, (req, res) => {
  try {
    const { error, value } = approveCredentialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { requestId } = req.params;
    const fileUrl = value.fileUrl || `https://credentials.example.com/${requestId}`;
    const timestamp = value.timestamp || new Date().toISOString();

    // Find verification request
    const vrIndex = verificationRequests.findIndex(vr => vr._id === requestId);
    if (vrIndex === -1) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const vrData = verificationRequests[vrIndex];

    // Check if already processed
    if (vrData.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already ${vrData.status}`,
        currentStatus: vrData.status
      });
    }

    // Generate credential hash
    const hash = generateCredentialHash(fileUrl, timestamp);

    // Update verification request
    verificationRequests[vrIndex].status = 'approved';
    verificationRequests[vrIndex].approvedAt = new Date().toISOString();

    // Create issued credential
    const issuedCred = {
      _id: `IC-${Date.now()}`,
      studentId: vrData.studentId,
      studentName: vrData.studentName,
      credentialType: vrData.credentialType,
      credentialTitle: vrData.credentialTitle,
      issuedBy: req.user.organization || 'University',
      issuedDate: new Date().toISOString().split('T')[0],
      verifiedOn: new Date().toISOString(),
      hash,
      status: 'verified',
    };

    issuedCredentials.push(issuedCred);

    res.json({
      success: true,
      message: 'Credential approved successfully',
      verificationRequest: verificationRequests[vrIndex],
      issuedCredential: issuedCred,
      hash,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error approving credential:', error);
    res.status(500).json({ error: 'Failed to approve credential' });
  }
});

/**
 * POST /api/university/verification/reject/:requestId
 * Reject a credential verification request
 */
router.post('/verification/reject/:requestId', requireUniversity, (req, res) => {
  try {
    const { error, value } = rejectCredentialSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { requestId } = req.params;
    const { reason } = value;

    // Find verification request
    const vrIndex = verificationRequests.findIndex(vr => vr._id === requestId);
    if (vrIndex === -1) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    const vrData = verificationRequests[vrIndex];

    // Check if already processed
    if (vrData.status !== 'pending') {
      return res.status(400).json({ 
        error: `Request already ${vrData.status}`,
        currentStatus: vrData.status
      });
    }

    // Update verification request
    verificationRequests[vrIndex].status = 'rejected';
    verificationRequests[vrIndex].rejectionReason = reason;
    verificationRequests[vrIndex].approvedAt = null;

    res.json({
      success: true,
      message: 'Credential rejected successfully',
      verificationRequest: verificationRequests[vrIndex],
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error rejecting credential:', error);
    res.status(500).json({ error: 'Failed to reject credential' });
  }
});

/**
 * GET /api/university/credentials/issued
 * List all credentials issued by this university
 */
router.get('/credentials/issued', requireUniversity, (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { page, limit } = value;
    const { type, startDate, endDate } = req.query;

    // Filter by credential type if provided
    let filtered = [...issuedCredentials];
    
    if (type) {
      filtered = filtered.filter(ic => ic.credentialType === type);
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      filtered = filtered.filter(ic => {
        const verifiedDate = new Date(ic.verifiedOn);
        if (startDate && verifiedDate < new Date(startDate)) return false;
        if (endDate && verifiedDate > new Date(endDate)) return false;
        return true;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedCreds = filtered.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: paginatedCreds,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching issued credentials:', error);
    res.status(500).json({ error: 'Failed to fetch issued credentials' });
  }
});

/**
 * GET /api/university/students/search
 * Search students by name, email, or degree
 */
router.get('/students/search', requireUniversity, (req, res) => {
  try {
    const { error, value } = searchStudentsSchema.validate(req.query);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const { name, email, degree, page, limit } = value;

    // Filter students based on search criteria
    let filtered = [...students];

    if (name) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(name.toLowerCase())
      );
    }

    if (email) {
      filtered = filtered.filter(s => 
        s.email.toLowerCase().includes(email.toLowerCase())
      );
    }

    if (degree) {
      filtered = filtered.filter(s => 
        s.degree.toLowerCase().includes(degree.toLowerCase())
      );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedStudents = filtered.slice(startIndex, endIndex);

    // Enrich student data with credential summary
    const enrichedStudents = paginatedStudents.map(student => ({
      ...student,
      credentialSummary: {
        issuedCount: issuedCredentials.filter(ic => ic.studentId === student._id).length,
        pendingCount: verificationRequests.filter(
          vr => vr.studentId === student._id && vr.status === 'pending'
        ).length,
      }
    }));

    res.json({
      success: true,
      data: enrichedStudents,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    });
  } catch (error) {
    console.error('Error searching students:', error);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

/**
 * GET /api/university/reports/analytics
 * Get analytics and statistics for university dashboard
 */
router.get('/reports/analytics', requireUniversity, (req, res) => {
  try {
    const totalPending = verificationRequests.filter(vr => vr.status === 'pending').length;
    const totalApproved = verificationRequests.filter(vr => vr.status === 'approved').length;
    const totalRejected = verificationRequests.filter(vr => vr.status === 'rejected').length;

    const avgVerificationTime = calculateAverageVerificationTime();

    // Calculate monthly stats for last 6 months
    const monthlyStats = {};
    for (let i = 0; i < 6; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format

      const issued = issuedCredentials.filter(ic => 
        ic.verifiedOn.startsWith(monthKey)
      ).length;

      monthlyStats[monthKey] = issued;
    }

    res.json({
      success: true,
      analytics: {
        summary: {
          totalPending,
          totalApproved,
          totalRejected,
          totalIssued: issuedCredentials.length,
          averageVerificationTimeMinutes: avgVerificationTime,
        },
        credentialBreakdown: {
          byType: issuedCredentials.reduce((acc, ic) => {
            acc[ic.credentialType] = (acc[ic.credentialType] || 0) + 1;
            return acc;
          }, {}),
          byStatus: {
            verified: issuedCredentials.filter(ic => ic.status === 'verified').length,
            pending: totalPending,
            rejected: totalRejected,
          }
        },
        monthlyVerifications: monthlyStats,
        recentActivity: {
          recentRequests: verificationRequests.slice(-5).reverse(),
          recentCredentials: issuedCredentials.slice(-5).reverse(),
        },
        timestamp: new Date().toISOString(),
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

/**
 * GET /api/university/verification/requests/:requestId
 * Get details of a specific verification request
 */
router.get('/verification/requests/:requestId', requireUniversity, (req, res) => {
  try {
    const { requestId } = req.params;

    const verificationRequest = verificationRequests.find(vr => vr._id === requestId);
    if (!verificationRequest) {
      return res.status(404).json({ error: 'Verification request not found' });
    }

    res.json({
      success: true,
      data: verificationRequest,
    });
  } catch (error) {
    console.error('Error fetching verification request:', error);
    res.status(500).json({ error: 'Failed to fetch verification request' });
  }
});

/**
 * GET /api/university/credentials/issued/:credentialId
 * Get details of a specific issued credential
 */
router.get('/credentials/issued/:credentialId', requireUniversity, (req, res) => {
  try {
    const { credentialId } = req.params;

    const credential = issuedCredentials.find(ic => ic._id === credentialId);
    if (!credential) {
      return res.status(404).json({ error: 'Credential not found' });
    }

    res.json({
      success: true,
      data: credential,
    });
  } catch (error) {
    console.error('Error fetching credential:', error);
    res.status(500).json({ error: 'Failed to fetch credential' });
  }
});

export default router;