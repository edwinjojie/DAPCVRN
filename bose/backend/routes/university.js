import express from 'express';
import Joi from 'joi';
import crypto from 'crypto';
import { requireUniversity } from '../middleware/roleMiddleware.js';
import { Credential, VerificationRequest, User } from '../models/index.js';

const router = express.Router();

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
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
});

const paginationSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string().valid('pending', 'approved', 'rejected').optional(),
});

// ==================== HELPERS ====================
function generateCredentialHash(fileUrl, timestamp) {
  const data = `${fileUrl}${timestamp}`;
  return crypto.createHash('sha256').update(data).digest('hex');
}

// ==================== ROUTES ====================

// GET /api/university/verification/requests
router.get('/verification/requests', requireUniversity, async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { page, limit, status } = value;
    const query = {};
    if (status) query.status = status;

    const total = await VerificationRequest.countDocuments(query);
    const requests = await VerificationRequest.find(query)
      .populate({ path: 'credentialId', populate: { path: 'userId', model: 'User' } })
      .populate('requesterId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = requests.map(r => {
      const cred = r.credentialId || {};
      const student = cred.userId || {};
      return {
        _id: r._id,
        studentId: student._id || cred.userId,
        studentName: cred.studentName || student.name || null,
        email: cred.studentEmail || student.email || null,
        certificateTitle: cred.title || cred.credentialTitle || null,
        status: r.status,
        submittedAt: r.createdAt,
        rejectionReason: r.status === 'rejected' ? (r.notes || null) : undefined,
        approvedAt: r.status === 'approved' ? r.updatedAt : undefined,
        raw: r,
      };
    });

    res.json({
      success: true,
      data: mapped,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// POST /api/university/verification/approve/:requestId
router.post('/verification/approve/:requestId', requireUniversity, async (req, res) => {
  try {
    const { error, value } = approveCredentialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { requestId } = req.params;
    const fileUrl = value.fileUrl || `https://credentials.example.com/${requestId}`;
    const timestamp = value.timestamp ? new Date(value.timestamp).toISOString() : new Date().toISOString();

    const vr = await VerificationRequest.findById(requestId).populate({ path: 'credentialId', populate: { path: 'userId', model: 'User' } });
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });
    if (vr.status !== 'pending') return res.status(400).json({ error: `Request already ${vr.status}`, currentStatus: vr.status });

    const hash = generateCredentialHash(fileUrl, timestamp);

    // Mark verification request as approved
    vr.status = 'approved';
    vr.updatedAt = new Date();
    await vr.save();

    // Update linked credential (if exists)
    let credential = null;
    if (vr.credentialId) {
      credential = await Credential.findById(vr.credentialId._id || vr.credentialId);
      if (credential) {
        credential.status = 'verified';
        credential.verifiedBy = req.user ? req.user._id : credential.verifiedBy;
        credential.verifiedAt = new Date();
        credential.dataHash = hash;
        credential.blockchainTimestamp = timestamp;
        credential.verificationNotes = credential.verificationNotes || '';
        await credential.save();
      }
    }

    res.json({
      success: true,
      message: 'Credential approved successfully',
      verificationRequest: vr,
      issuedCredential: credential,
      hash,
      timestamp,
    });
  } catch (err) {
    console.error('Error approving credential:', err);
    res.status(500).json({ error: 'Failed to approve credential' });
  }
});

// POST /api/university/verification/reject/:requestId
router.post('/verification/reject/:requestId', requireUniversity, async (req, res) => {
  try {
    const { error, value } = rejectCredentialSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { requestId } = req.params;
    const { reason } = value;

    const vr = await VerificationRequest.findById(requestId);
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });
    if (vr.status !== 'pending') return res.status(400).json({ error: `Request already ${vr.status}`, currentStatus: vr.status });

    vr.status = 'rejected';
    vr.notes = reason;
    vr.updatedAt = new Date();
    await vr.save();

    res.json({
      success: true,
      message: 'Credential rejected successfully',
      verificationRequest: vr,
      rejectionReason: reason,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    console.error('Error rejecting credential:', err);
    res.status(500).json({ error: 'Failed to reject credential' });
  }
});

// GET /api/university/credentials/issued
router.get('/credentials/issued', requireUniversity, async (req, res) => {
  try {
    const { error, value } = paginationSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { page, limit } = value;
    const { type, startDate, endDate } = req.query;

    const query = {};
    // filter to this university's issued credentials
    if (req.user && req.user.organization) {
      query.organization = req.user.organization;
    } else if (req.user && req.user._id) {
      query.issuerId = req.user._id;
    }

    if (type) query.type = type;
    if (startDate || endDate) query.verifiedAt = {};
    if (startDate) query.verifiedAt.$gte = new Date(startDate);
    if (endDate) query.verifiedAt.$lte = new Date(endDate);

    const total = await Credential.countDocuments(query);
    const creds = await Credential.find(query)
      .sort({ verifiedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const mapped = creds.map(c => ({
      _id: c._id,
      studentId: c.userId,
      studentName: c.studentName,
      credentialType: c.type,
      issuedAt: c.verifiedAt || c.issueDate,
      hash: c.dataHash || null,
      status: c.status,
      raw: c,
    }));

    res.json({
      success: true,
      data: mapped,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    console.error('Error fetching issued credentials:', err);
    res.status(500).json({ error: 'Failed to fetch issued credentials' });
  }
});

// GET /api/university/students/search
router.get('/students/search', requireUniversity, async (req, res) => {
  try {
    const { error, value } = searchStudentsSchema.validate(req.query);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, page, limit } = value;
    const q = { role: 'student' };
    if (name) q.name = { $regex: name, $options: 'i' };
    if (email) q.email = { $regex: email, $options: 'i' };

    const total = await User.countDocuments(q);
    const students = await User.find(q).skip((page - 1) * limit).limit(limit).lean();

    // Enrich student data with credential counts
    const enriched = await Promise.all(students.map(async s => {
      const issuedCount = await Credential.countDocuments({ userId: s._id, status: { $in: ['issued', 'verified'] } });
      // count pending verification requests by joining via credential.userId
      const studentCreds = await Credential.find({ userId: s._id }).select('_id').lean();
      const credIds = studentCreds.map(c => c._id);
      const pendingCount = await VerificationRequest.countDocuments({ credentialId: { $in: credIds }, status: 'pending' });
      return {
        _id: s._id,
        name: s.name,
        email: s.email,
        degree: s.metadata?.degree || null,
        enrollmentNumber: s.metadata?.enrollmentNumber || null,
        credentialsSummary: { issued: issuedCount, pending: pendingCount },
      };
    }));

    res.json({ success: true, data: enriched, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Error searching students:', err);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// GET /api/university/reports/analytics
router.get('/reports/analytics', requireUniversity, async (req, res) => {
  try {
    const totalPending = await VerificationRequest.countDocuments({ status: 'pending' });
    const totalApproved = await VerificationRequest.countDocuments({ status: 'approved' });
    const totalRejected = await VerificationRequest.countDocuments({ status: 'rejected' });

    // average verification time (minutes)
    const approvedRequests = await VerificationRequest.find({ status: 'approved' }).select('createdAt updatedAt').lean();
    let avgMinutes = 0;
    if (approvedRequests.length > 0) {
      const totalMs = approvedRequests.reduce((sum, r) => sum + (new Date(r.updatedAt) - new Date(r.createdAt)), 0);
      avgMinutes = Math.round(totalMs / approvedRequests.length / (1000 * 60));
    }

    // monthly stats for last 6 months
    const monthly = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0,0,0,0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      const count = await Credential.countDocuments({ verifiedAt: { $gte: start, $lt: end } });
      monthly.push({ month: start.toISOString().slice(0,7), issued: count });
    }

    // recent activity
    const recentRequests = await VerificationRequest.find().sort({ createdAt: -1 }).limit(5).lean();
    const recentCredentials = await Credential.find().sort({ verifiedAt: -1 }).limit(5).lean();

    res.json({
      success: true,
      analytics: {
        summary: {
          totalPending,
          pendingRequests: totalPending,
          approvedCredentials: totalApproved,
          rejectedRequests: totalRejected,
          averageVerificationTimeMinutes: avgMinutes,
        },
        credentialBreakdown: {
          byType: await Credential.aggregate([{ $group: { _id: '$type', count: { $sum: 1 } } }]),
          byStatus: {
            verified: await Credential.countDocuments({ status: 'verified' }),
            pending: totalPending,
            rejected: totalRejected,
          }
        },
        monthlyStats: monthly,
        recentActivity: { recentRequests, recentCredentials },
        timestamp: new Date().toISOString(),
      }
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// GET /api/university/verification/requests/:requestId
router.get('/verification/requests/:requestId', requireUniversity, async (req, res) => {
  try {
    const { requestId } = req.params;
    const vr = await VerificationRequest.findById(requestId).populate({ path: 'credentialId', populate: { path: 'userId', model: 'User' } }).lean();
    if (!vr) return res.status(404).json({ error: 'Verification request not found' });
    res.json({ success: true, data: vr });
  } catch (err) {
    console.error('Error fetching verification request:', err);
    res.status(500).json({ error: 'Failed to fetch verification request' });
  }
});

// GET /api/university/credentials/issued/:credentialId
router.get('/credentials/issued/:credentialId', requireUniversity, async (req, res) => {
  try {
    const { credentialId } = req.params;
    const cred = await Credential.findById(credentialId).lean();
    if (!cred) return res.status(404).json({ error: 'Credential not found' });
    res.json({ success: true, data: cred });
  } catch (err) {
    console.error('Error fetching credential:', err);
    res.status(500).json({ error: 'Failed to fetch credential' });
  }
});

export default router;