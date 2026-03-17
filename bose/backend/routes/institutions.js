/**
 * routes/institutions.js
 * Routes for institution/verifier/issuer roles – mirror of university.js
 * Mounted at /api/institutions
 *
 * GET  /                          – list active institutions (dropdown)
 * GET  /verification/requests     – list pending verification requests
 * GET  /verification/requests/:id – single request details
 * POST /verification/approve/:id  – approve a credential
 * POST /verification/reject/:id   – reject a credential
 * GET  /credentials/issued        – credentials issued by this institution
 * GET  /credentials/issued/:id    – single issued credential
 * GET  /students/search           – search enrolled students
 * GET  /reports/analytics         – analytics dashboard
 */

import express from 'express';
import { Credential, VerificationRequest, User } from '../models/index.js';

const router = express.Router();

// ── MIDDLEWARE: require institution/verifier/issuer role ──────────────────────
const requireInstitution = (req, res, next) => {
  const allowed = ['institution', 'verifier', 'issuer', 'university', 'admin'];
  if (!req.user || !allowed.includes(req.user.role)) {
    return res.status(403).json({ error: 'Access restricted to institution accounts' });
  }
  next();
};

// ── GET / – list institutions for dropdown ────────────────────────────────────
router.get('/', async (req, res) => {
  try {
    const universities = await User.find({ role: { $in: ['university', 'institution'] }, isActive: true })
      .select('name email organization')
      .sort({ organization: 1 })
      .lean();

    const institutions = universities.map(uni => ({
      id: uni._id.toString(),
      name: uni.organization || uni.name,
      contactName: uni.name,
      contactEmail: uni.email
    }));

    res.json(institutions);
  } catch (error) {
    console.error('Error fetching institutions:', error);
    res.status(500).json({ error: 'Failed to fetch institutions' });
  }
});

// ── GET /verification/requests ────────────────────────────────────────────────
router.get('/verification/requests', requireInstitution, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const query = {};
    if (req.query.status) query.status = req.query.status;

    const total = await VerificationRequest.countDocuments(query);
    const requests = await VerificationRequest.find(query)
      .populate({ path: 'credentialId', populate: { path: 'userId', model: 'User' } })
      .populate('requesterId')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const data = requests.map(r => {
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
      };
    });

    res.json({ success: true, data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Error fetching verification requests:', err);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// ── GET /verification/requests/:id ────────────────────────────────────────────
router.get('/verification/requests/:id', requireInstitution, async (req, res) => {
  try {
    const request = await VerificationRequest.findById(req.params.id)
      .populate({ path: 'credentialId', populate: { path: 'userId', model: 'User' } })
      .populate('requesterId')
      .lean();

    if (!request) return res.status(404).json({ error: 'Request not found' });
    res.json({ success: true, data: request });
  } catch (err) {
    console.error('Error fetching verification request:', err);
    res.status(500).json({ error: 'Failed to fetch request' });
  }
});

// ── POST /verification/approve/:id ────────────────────────────────────────────
router.post('/verification/approve/:id', requireInstitution, async (req, res) => {
  try {
    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', notes: req.body.notes || '', updatedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });

    // Update the underlying credential status too
    if (request.credentialId) {
      await Credential.findByIdAndUpdate(request.credentialId, { status: 'verified' });
    }

    res.json({ success: true, message: 'Credential approved', data: request });
  } catch (err) {
    console.error('Error approving credential:', err);
    res.status(500).json({ error: 'Failed to approve credential' });
  }
});

// ── POST /verification/reject/:id ─────────────────────────────────────────────
router.post('/verification/reject/:id', requireInstitution, async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: 'Rejection reason is required' });

    const request = await VerificationRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', notes: reason, updatedAt: new Date() },
      { new: true }
    );
    if (!request) return res.status(404).json({ error: 'Request not found' });

    res.json({ success: true, message: 'Credential rejected', data: request });
  } catch (err) {
    console.error('Error rejecting credential:', err);
    res.status(500).json({ error: 'Failed to reject credential' });
  }
});

// ── GET /credentials/issued ───────────────────────────────────────────────────
router.get('/credentials/issued', requireInstitution, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const query = { issuerId: req.user.userId };
    if (req.query.type) query.credentialType = req.query.type;
    if (req.query.startDate) query.issuedAt = { $gte: new Date(req.query.startDate) };
    if (req.query.endDate) query.issuedAt = { ...query.issuedAt, $lte: new Date(req.query.endDate) };

    const total = await Credential.countDocuments(query);
    const credentials = await Credential.find(query)
      .populate('userId', 'name email')
      .sort({ issuedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data: credentials, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Error fetching issued credentials:', err);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

// ── GET /credentials/issued/:id ───────────────────────────────────────────────
router.get('/credentials/issued/:id', requireInstitution, async (req, res) => {
  try {
    const credential = await Credential.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();
    if (!credential) return res.status(404).json({ error: 'Credential not found' });
    res.json({ success: true, data: credential });
  } catch (err) {
    console.error('Error fetching credential:', err);
    res.status(500).json({ error: 'Failed to fetch credential' });
  }
});

// ── GET /students/search ──────────────────────────────────────────────────────
router.get('/students/search', requireInstitution, async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const query = { role: 'student' };
    if (req.query.name) query.name = { $regex: req.query.name, $options: 'i' };
    if (req.query.email) query.email = { $regex: req.query.email, $options: 'i' };

    const total = await User.countDocuments(query);
    const students = await User.find(query)
      .select('name email organization createdAt')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    res.json({ success: true, data: students, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    console.error('Error searching students:', err);
    res.status(500).json({ error: 'Failed to search students' });
  }
});

// ── GET /reports/analytics ────────────────────────────────────────────────────
router.get('/reports/analytics', requireInstitution, async (req, res) => {
  try {
    const issuerId = req.user.userId;

    const [totalRequests, pendingRequests, approvedCredentials, rejectedRequests] = await Promise.all([
      VerificationRequest.countDocuments({}),
      VerificationRequest.countDocuments({ status: 'pending' }),
      Credential.countDocuments({ issuerId, status: 'verified' }),
      VerificationRequest.countDocuments({ status: 'rejected' }),
    ]);

    const credentialBreakdown = await Credential.aggregate([
      { $group: { _id: '$credentialType', count: { $sum: 1 } } },
      { $project: { type: '$_id', count: 1, _id: 0 } }
    ]);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const monthlyStats = await Credential.aggregate([
      { $match: { issuedAt: { $gte: sixMonthsAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m', date: '$issuedAt' } }, issued: { $sum: 1 } } },
      { $project: { month: '$_id', issued: 1, _id: 0 } },
      { $sort: { month: 1 } }
    ]);

    res.json({
      success: true,
      summary: { totalRequests, pendingRequests, approvedCredentials, rejectedRequests, averageVerificationTimeMinutes: 42 },
      credentialBreakdown,
      monthlyStats,
      recentActivity: []
    });
  } catch (err) {
    console.error('Error fetching analytics:', err);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

export default router;
