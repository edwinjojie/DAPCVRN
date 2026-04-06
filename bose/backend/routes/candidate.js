/**
 * routes/candidate.js
 * Student/Candidate summary and dashboard stats – DB-backed
 * Mounted at /api/candidate
 */
import express from 'express';
import { Credential } from '../models/index.js';
import Application from '../models/Application.js';
import Notification from '../models/Notification.js';
import Profile from '../models/Profile.js';

const router = express.Router();

/**
 * GET /api/candidate/summary
 * Returns live counts for the authenticated student's dashboard cards.
 */
router.get('/summary', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [verifiedCredentials, pendingCredentials, activeApplications, unreadNotifications] =
      await Promise.all([
        Credential.countDocuments({ userId, status: 'verified' }).catch(() => 0),
        Credential.countDocuments({ userId, status: 'pending' }).catch(() => 0),
        Application.countDocuments({
          candidateId: userId,
          status: { $in: ['submitted', 'under_review', 'interview', 'applied'] }
        }).catch(() => 0),
        Notification.countDocuments({ userId, read: false }).catch(() => 0),
      ]);

    res.json({
      verifiedCredentials,
      pendingCredentials,
      activeApplications,
      unreadMessages: unreadNotifications, // legacy key the frontend uses
    });
  } catch (error) {
    console.error('Error fetching candidate summary:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

/**
 * GET /api/candidate/dashboard-stats
 * Extended stats for a richer dashboard.
 */
router.get('/dashboard-stats', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [
      totalCredentials,
      verifiedCredentials,
      pendingCredentials,
      rejectedCredentials,
      blockchainAnchored,
      totalApplications,
      activeApplications,
      profile,
    ] = await Promise.all([
      Credential.countDocuments({ userId }).catch(() => 0),
      Credential.countDocuments({ userId, status: 'verified' }).catch(() => 0),
      Credential.countDocuments({ userId, status: 'pending' }).catch(() => 0),
      Credential.countDocuments({ userId, status: 'revoked' }).catch(() => 0),
      Credential.countDocuments({ userId, blockchainTxId: { $ne: null } }).catch(() => 0),
      Application.countDocuments({ candidateId: userId }).catch(() => 0),
      Application.countDocuments({
        candidateId: userId,
        status: { $in: ['submitted', 'under_review', 'interview', 'applied'] }
      }).catch(() => 0),
      Profile.findOne({ userId }).select('completeness').lean().catch(() => null),
    ]);

    res.json({
      credentials: {
        total: totalCredentials,
        verified: verifiedCredentials,
        pending: pendingCredentials,
        rejected: rejectedCredentials,
        blockchainAnchored,
      },
      applications: {
        total: totalApplications,
        active: activeApplications,
      },
      profileCompleteness: profile?.completeness || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

export default router;
