import express from "express";
import { Organization, User, Credential, VerificationRequest, AuditLog } from "../models/index.js";
import { requireAdmin } from "../middleware/roleMiddleware.js";
import * as blockchainService from "../services/blockchainService.js";

const router = express.Router();

// Helper for logging admin actions
async function logAdminAction(req, action, targetType, targetId, targetName, reason = null, details = {}) {
  try {
    await AuditLog.create({
      adminId: req.user.userId || req.user._id,
      adminName: req.user.name,
      action,
      targetType,
      targetId: targetId.toString(),
      targetName,
      reason,
      details,
      ipAddress: req.ip || req.connection.remoteAddress
    });
  } catch (err) {
    console.error("Audit logging failed:", err);
  }
}

// Apply requireAdmin middleware to all routes
router.use(requireAdmin);

/**
 * @route   GET /api/admin/summary
 * @desc    Get network-wide summary statistics
 */
router.get("/summary", async (req, res) => {
  try {
    const totalOrgs = await Organization.countDocuments();
    const approvedOrgs = await Organization.countDocuments({ status: 'approved' });
    const pendingOrgs = await Organization.countDocuments({ status: 'pending' });
    const suspendedOrgs = await Organization.countDocuments({ status: 'suspended' });
    
    const totalUsers = await User.countDocuments();
    const totalCredentials = await Credential.countDocuments();
    const totalVerifications = await VerificationRequest.countDocuments();

    res.json({
      success: true,
      data: {
        organizations: {
          total: totalOrgs,
          approved: approvedOrgs,
          pending: pendingOrgs,
          suspended: suspendedOrgs
        },
        network: {
          totalUsers,
          totalCredentials,
          totalVerifications
        }
      }
    });
  } catch (err) {
    console.error("Error in admin summary:", err);
    res.status(500).json({ error: "Failed to fetch admin summary" });
  }
});

/**
 * @route   GET /api/admin/orgs
 * @desc    Get all organizations with their admins and stats
 */
router.get("/orgs", async (req, res) => {
  try {
    const orgs = await Organization.find()
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .lean();

    // Enhance orgs with member count, issuance stats, and risk data
    const enhancedOrgs = await Promise.all(orgs.map(async (org) => {
      const memberCount = await User.countDocuments({ organizationId: org._id });
      const credentialsCount = await Credential.countDocuments({ institutionId: org._id });
      
      // Calculate rejection rate for risk scoring
      const totalVerifications = await VerificationRequest.countDocuments({ institutionId: org._id });
      const rejectedVerifications = await VerificationRequest.countDocuments({ institutionId: org._id, status: 'rejected' });
      const rejectionRate = totalVerifications > 0 ? (rejectedVerifications / totalVerifications) * 100 : 0;
      
      return {
        ...org,
        memberCount,
        credentialsCount,
        rejectionRate
      };
    }));

    res.json({ success: true, data: enhancedOrgs });
  } catch (err) {
    console.error("Error fetching organizations:", err);
    res.status(500).json({ error: "Failed to fetch organizations" });
  }
});

/**
 * @route   GET /api/admin/orgs/:id
 * @desc    Get detailed organization profile
 */
router.get("/orgs/:id", async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id)
      .populate('approvedBy', 'name email')
      .lean();

    if (!org) return res.status(404).json({ error: "Organization not found" });

    // Fetch associated admin user(s)
    const admins = await User.find({ organizationId: org._id, role: { $in: ['university', 'institution'] } })
      .select('name email lastLogin isActive')
      .lean();

    res.json({ success: true, data: { ...org, admins } });
  } catch (err) {
    console.error("Error fetching organization details:", err);
    res.status(500).json({ error: "Failed to fetch organization details" });
  }
});

/**
 * @route   POST /api/admin/orgs/:id/approve
 * @desc    Approve an organization
 */
router.post("/orgs/:id/approve", async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    org.status = 'approved';
    org.approved = true;
    org.approvedBy = req.user.userId || req.user._id;
    org.approvedAt = new Date();
    org.isActive = true;
    org.rejectionReason = null; // Clear if previously rejected

    await org.save();
    await logAdminAction(req, 'APPROVE_ORG', 'ORGANIZATION', org._id, org.name);
    res.json({ success: true, message: "Organization approved successfully" });
  } catch (err) {
    console.error("Error approving organization:", err);
    res.status(500).json({ error: "Failed to approve organization" });
  }
});

/**
 * @route   POST /api/admin/orgs/:id/reject
 * @desc    Reject an organization with reason
 */
router.post("/orgs/:id/reject", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Rejection reason is required" });

    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    org.status = 'rejected';
    org.approved = false;
    org.rejectionReason = reason;
    org.isActive = false;

    await org.save();
    await logAdminAction(req, 'REJECT_ORG', 'ORGANIZATION', org._id, org.name, reason);
    res.json({ success: true, message: "Organization rejected successfully" });
  } catch (err) {
    console.error("Error rejecting organization:", err);
    res.status(500).json({ error: "Failed to reject organization" });
  }
});

/**
 * @route   POST /api/admin/orgs/:id/suspend
 * @desc    Suspend an active organization
 */
router.post("/orgs/:id/suspend", async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    org.status = 'suspended';
    org.isActive = false;

    await org.save();
    await logAdminAction(req, 'SUSPEND_ORG', 'ORGANIZATION', org._id, org.name);
    res.json({ success: true, message: "Organization suspended successfully" });
  } catch (err) {
    console.error("Error suspending organization:", err);
    res.status(500).json({ error: "Failed to suspend organization" });
  }
});

/**
 * @route   POST /api/admin/orgs/:id/reactivate
 * @desc    Reactivate a suspended organization
 */
router.post("/orgs/:id/reactivate", async (req, res) => {
  try {
    const org = await Organization.findById(req.params.id);
    if (!org) return res.status(404).json({ error: "Organization not found" });

    org.status = 'approved';
    org.isActive = true;

    await org.save();
    await logAdminAction(req, 'REACTIVATE_ORG', 'ORGANIZATION', org._id, org.name);
    res.json({ success: true, message: "Organization reactivated successfully" });
  } catch (err) {
    console.error("Error reactivating organization:", err);
    res.status(500).json({ error: "Failed to reactivate organization" });
  }
});

// ==================== USER MANAGEMENT ROUTES (Phase 2) ====================

/**
 * @route   GET /api/admin/users
 * @desc    Get all users across system with filters
 */
router.get("/users", async (req, res) => {
  try {
    const { role, status, search } = req.query;
    const query = {};
    
    if (role) query.role = role;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('name email role status isActive lastLogin organization createdAt')
      .populate('organizationId', 'name')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: users });
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get detailed user profile and activity
 */
router.get("/users/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('organizationId', 'name type')
      .lean();

    if (!user) return res.status(404).json({ error: "User not found" });

    // Fetch related stats
    const credentialsCount = await Credential.countDocuments({ userId: user._id });
    const verificationsCount = await VerificationRequest.countDocuments({ studentId: user._id });

    res.json({ 
      success: true, 
      data: { ...user, stats: { credentialsCount, verificationsCount } } 
    });
  } catch (err) {
    console.error("Error fetching user details:", err);
    res.status(500).json({ error: "Failed to fetch user details" });
  }
});

/**
 * @route   POST /api/admin/users/:id/ban
 * @desc    Ban a user
 */
router.post("/users/:id/ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    if (user.role === 'admin') return res.status(403).json({ error: "Cannot ban an administrator" });

    user.status = 'banned';
    user.isActive = false;
    await user.save();
    await logAdminAction(req, 'BAN_USER', 'USER', user._id, user.name);
    res.json({ success: true, message: "User banned successfully" });
  } catch (err) {
    console.error("Error banning user:", err);
    res.status(500).json({ error: "Failed to ban user" });
  }
});

/**
 * @route   POST /api/admin/users/:id/unban
 * @desc    Unban a user
 */
router.post("/users/:id/unban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    user.status = 'active';
    user.isActive = true;
    await user.save();
    await logAdminAction(req, 'UNBAN_USER', 'USER', user._id, user.name);
    res.json({ success: true, message: "User unbanned successfully" });
  } catch (err) {
    console.error("Error unbanning user:", err);
    res.status(500).json({ error: "Failed to unban user" });
  }
});

/**
 * @route   POST /api/admin/users/:id/role
 * @desc    Change user role (Reset role)
 */
router.post("/users/:id/role", async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'university', 'recruiter', 'admin'];
    if (!allowedRoles.includes(role)) return res.status(400).json({ error: "Invalid role" });

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });

    const oldRole = user.role;
    user.role = role;
    await user.save();
    await logAdminAction(req, 'ROLE_CHANGE', 'USER', user._id, user.name, null, { from: oldRole, to: role });
    res.json({ success: true, message: "User role updated successfully" });
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ error: "Failed to update user role" });
  }
});

// ==================== GLOBAL CREDENTIAL CONTROL (Phase 3) ====================

/**
 * @route   GET /api/admin/credentials
 * @desc    Get all credentials across system with filters
 */
router.get("/credentials", async (req, res) => {
  try {
    const { type, status, search } = req.query;
    const query = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { studentName: { $regex: search, $options: 'i' } },
        { institution: { $regex: search, $options: 'i' } }
      ];
    }

    const credentials = await Credential.find(query)
      .sort({ createdAt: -1 })
      .lean();

    // Check for duplicates (Simple example: same title + studentName + institution)
    const processed = new Set();
    const duplicates = new Set();
    credentials.forEach(c => {
      const key = `${c.title}-${c.studentName}-${c.institution}`.toLowerCase();
      if (processed.has(key)) duplicates.add(c._id.toString());
      processed.add(key);
    });

    const data = credentials.map(c => ({
      ...c,
      isPotentialDuplicate: duplicates.has(c._id.toString())
    }));

    res.json({ success: true, data });
  } catch (err) {
    console.error("Error fetching credentials:", err);
    res.status(500).json({ error: "Failed to fetch credentials" });
  }
});

/**
 * @route   POST /api/admin/credentials/:id/revoke
 * @desc    Admin override to revoke a credential
 */
router.post("/credentials/:id/revoke", async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) return res.status(400).json({ error: "Revocation reason is required" });

    const cred = await Credential.findById(req.params.id);
    if (!cred) return res.status(404).json({ error: "Credential not found" });

    // Update DB
    cred.status = 'revoked';
    cred.revocationReason = reason;
    cred.revokedAt = new Date();
    cred.revokedBy = req.user.userId || req.user._id;

    // Revoke on blockchain if anchored
    let blockchainRevocation = { status: 'not_anchored' };
    if (cred.blockchainTxId) {
      try {
        await blockchainService.revokeCertificate({
          credentialId: cred.credentialId || cred._id.toString(),
          reason: `Admin Override: ${reason}`
        });
        blockchainRevocation = { status: 'revoked', timestamp: new Date() };
      } catch (bcError) {
        console.error('Blockchain revocation failed:', bcError.message);
        blockchainRevocation = { status: 'failed', error: bcError.message };
      }
    }

    await cred.save();
    await logAdminAction(req, 'REVOKE_CREDENTIAL', 'CREDENTIAL', cred._id, cred.title, reason);
    res.json({ 
      success: true, 
      message: "Credential revoked successfully", 
      blockchain: blockchainRevocation 
    });
  } catch (err) {
    console.error("Error revoking credential:", err);
    res.status(500).json({ error: "Failed to revoke credential" });
  }
});

// ==================== ADVANCED NETWORK ANALYTICS (Phase 4) ====================

/**
 * @route   GET /api/admin/analytics/detailed
 * @desc    Get detailed network analytics including growth and fraud indicators
 */
router.get("/analytics/detailed", async (req, res) => {
  try {
    // 1. Growth Metrics (Last 6 Months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const growthMetrics = await User.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    const credentialGrowth = await Credential.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
          _id: { 
            year: { $year: "$createdAt" }, 
            month: { $month: "$createdAt" } 
          },
          count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 2. Role Distribution
    const roleDistribution = await User.aggregate([
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]);

    // 3. Fraud Indicators
    const totalRequests = await VerificationRequest.countDocuments();
    const rejectedRequests = await VerificationRequest.countDocuments({ status: 'rejected' });
    const revokedCredentials = await Credential.countDocuments({ status: 'revoked' });
    
    // Check for "Suspicious Orgs" (Orgs with high rejection rate)
    const suspiciousOrgs = await VerificationRequest.aggregate([
      { $group: {
          _id: "$universityId",
          total: { $sum: 1 },
          rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } }
      }},
      { $match: { total: { $gt: 5 } } }, // Only look at orgs with > 5 requests
      { $addFields: { rejectionRate: { $divide: ["$rejected", "$total"] } } },
      { $match: { rejectionRate: { $gt: 0.4 } } }, // > 40% rejection rate
      { $sort: { rejectionRate: -1 } },
      { $limit: 5 }
    ]);

    res.json({
      success: true,
      data: {
        growth: {
          users: growthMetrics,
          credentials: credentialGrowth
        },
        distribution: roleDistribution,
        fraud: {
          rejectionRate: totalRequests > 0 ? (rejectedRequests / totalRequests) * 100 : 0,
          revocationCount: revokedCredentials,
          suspiciousOrgsCount: suspiciousOrgs.length,
          suspiciousOrgsDetails: suspiciousOrgs
        }
      }
    });
  } catch (err) {
    console.error("Error in detailed analytics:", err);
    res.status(500).json({ error: "Failed to fetch detailed analytics" });
  }
});

// ==================== BLOCKCHAIN OVERSIGHT (Phase 5) ====================

/**
 * @route   GET /api/admin/blockchain/health
 * @desc    Get blockchain network status and metrics
 */
router.get("/blockchain/health", async (req, res) => {
  try {
    // In a real Hyperledger Fabric setup, you'd query the peer for actual status.
    // For this implementation, we check if the blockchain service is reachable.
    let status = 'UP';
    let latency = 0;
    
    try {
      const start = Date.now();
      // Assume blockchain service has a health or simple GET route
      await blockchainService.verifyCredential('ping-check');
      latency = Date.now() - start;
    } catch (err) {
      status = 'DOWN';
    }

    // Aggregating transaction success rate from local records
    const totalTx = await Credential.countDocuments({ blockchainTxId: { $exists: true } });
    const failedTx = await Credential.countDocuments({ status: 'pending', blockchainTxId: null });

    res.json({
      success: true,
      data: {
        status,
        latency: `${latency}ms`,
        peers: [
          { name: 'peer0.org1.bose.com', status: status === 'UP' ? 'Running' : 'Offline', role: 'Endorser' },
          { name: 'orderer.bose.com', status: status === 'UP' ? 'Running' : 'Offline', role: 'Orderer' }
        ],
        metrics: {
          totalTransactions: totalTx,
          successRate: totalTx > 0 ? ((totalTx / (totalTx + failedTx)) * 100).toFixed(1) + '%' : '100%'
        }
      }
    });
  } catch (err) {
    console.error("Error in blockchain health:", err);
    res.status(500).json({ error: "Failed to fetch blockchain health" });
  }
});

/**
 * @route   GET /api/admin/blockchain/transactions
 * @desc    Get recent blockchain transactions
 */
router.get("/blockchain/transactions", async (req, res) => {
  try {
    const transactions = await Credential.find({ blockchainTxId: { $ne: null } })
      .select('title studentName institution issueDate blockchainTxId status updatedAt')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();

    res.json({
      success: true,
      data: transactions
    });
  } catch (err) {
    console.error("Error in blockchain transactions:", err);
    res.status(500).json({ error: "Failed to fetch blockchain transactions" });
  }
});

/**
 * @route   POST /api/admin/blockchain/verify-manual
 * @desc    Manually verify a credential against the blockchain
 */
router.post("/blockchain/verify-manual", async (req, res) => {
  try {
    const { credentialId } = req.body;
    if (!credentialId) return res.status(400).json({ error: "Credential ID is required" });

    const result = await blockchainService.verifyCredential(credentialId);
    
    await logAdminAction(req, 'MANUAL_VERIFY', 'CREDENTIAL', credentialId, 'Manual Blockchain Check');

    res.json({
      success: true,
      data: result
    });
  } catch (err) {
    console.error("Error in manual verification:", err);
    res.status(500).json({ error: "Blockchain verification failed" });
  }
});

/**
 * @route   POST /api/admin/blockchain/retry/:id
 * @desc    Retry a failed blockchain anchor transaction
 */
router.post("/blockchain/retry/:id", async (req, res) => {
  try {
    const cred = await Credential.findById(req.params.id);
    if (!cred) return res.status(404).json({ error: "Credential not found" });
    if (cred.blockchainTxId) return res.status(400).json({ error: "Already anchored to blockchain" });

    try {
      const bcResponse = await blockchainService.addCertificate({
        credentialId: cred.credentialId || cred._id.toString(),
        studentId: cred.studentId || cred.userId.toString(),
        institution: cred.institution,
        credentialHash: cred.dataHash || cred.credentialHash,
        issueDate: cred.issueDate
      });

      cred.blockchainTxId = bcResponse.txId;
      await cred.save();

      await logAdminAction(req, 'RETRY_BLOCKCHAIN', 'CREDENTIAL', cred._id, cred.title, 'Manual Admin Retry');

      res.json({ success: true, message: "Blockchain anchor successful", txId: bcResponse.txId });
    } catch (bcError) {
      res.status(500).json({ error: "Blockchain retry failed", details: bcError.message });
    }
  } catch (err) {
    console.error("Error in retry blockchain:", err);
    res.status(500).json({ error: "Internal server error during retry" });
  }
});

// ==================== SYSTEM LOGS (Phase 7) ====================

/**
 * @route   GET /api/admin/logs
 * @desc    Get administrative audit logs
 */
router.get("/logs", async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    res.json({
      success: true,
      data: logs
    });
  } catch (err) {
    console.error("Error fetching logs:", err);
    res.status(500).json({ error: "Failed to fetch audit logs" });
  }
});

export default router;


