import express from 'express';
import fabricNetwork from '../services/fabricNetwork.js';

const router = express.Router();

// Get credential statistics
router.get('/stats', async (req, res) => {
  try {
    // Only auditors and employers can access analytics
    if (!['auditor', 'employer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions to access analytics' });
    }

    const allCredentials = await fabricNetwork.queryAllCredentials();
    
    if (!allCredentials) {
      return res.json({
        success: true,
        stats: {
          total: 0,
          active: 0,
          revoked: 0,
          byOrg: {},
          recent: []
        }
      });
    }

    const stats = {
      total: allCredentials.length,
      active: allCredentials.filter(c => c.status === 'active').length,
      revoked: allCredentials.filter(c => c.status === 'revoked').length,
      byOrg: {},
      byMonth: {},
      recentActivity: allCredentials
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
        .slice(0, 10)
    };

    // Group by organization
    allCredentials.forEach(cred => {
      stats.byOrg[cred.issuer] = (stats.byOrg[cred.issuer] || 0) + 1;
    });

    // Group by month for trending
    allCredentials.forEach(cred => {
      const month = new Date(cred.issuedAt).toISOString().slice(0, 7);
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;
    });

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error getting analytics stats:', error);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
});

// Get issuance trends
router.get('/trends', async (req, res) => {
  try {
    if (!['auditor', 'employer'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const allCredentials = await fabricNetwork.queryAllCredentials();
    
    if (!allCredentials) {
      return res.json({ success: true, trends: [] });
    }

    // Generate monthly trends for last 12 months
    const trends = [];
    const now = new Date();
    
    for (let i = 11; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = month.toISOString().slice(0, 7);
      
      const monthlyCredentials = allCredentials.filter(cred => {
        const credMonth = new Date(cred.issuedAt).toISOString().slice(0, 7);
        return credMonth === monthKey;
      });

      trends.push({
        month: monthKey,
        monthName: month.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        total: monthlyCredentials.length,
        active: monthlyCredentials.filter(c => c.status === 'active').length,
        revoked: monthlyCredentials.filter(c => c.status === 'revoked').length
      });
    }

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Error getting trends:', error);
    res.status(500).json({ error: 'Failed to retrieve trends' });
  }
});

// Get organization performance
router.get('/organizations', async (req, res) => {
  try {
    if (!['auditor'].includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const allCredentials = await fabricNetwork.queryAllCredentials();
    
    if (!allCredentials) {
      return res.json({ success: true, organizations: [] });
    }

    const orgStats = {};
    
    allCredentials.forEach(cred => {
      if (!orgStats[cred.issuer]) {
        orgStats[cred.issuer] = {
          organization: cred.issuer,
          total: 0,
          active: 0,
          revoked: 0,
          lastIssued: null
        };
      }
      
      orgStats[cred.issuer].total++;
      if (cred.status === 'active') {
        orgStats[cred.issuer].active++;
      } else if (cred.status === 'revoked') {
        orgStats[cred.issuer].revoked++;
      }
      
      if (!orgStats[cred.issuer].lastIssued || new Date(cred.issuedAt) > new Date(orgStats[cred.issuer].lastIssued)) {
        orgStats[cred.issuer].lastIssued = cred.issuedAt;
      }
    });

    const organizations = Object.values(orgStats).map(org => ({
      ...org,
      successRate: org.total > 0 ? ((org.active / org.total) * 100).toFixed(2) : 0
    }));

    res.json({
      success: true,
      organizations
    });
  } catch (error) {
    console.error('Error getting organization analytics:', error);
    res.status(500).json({ error: 'Failed to retrieve organization analytics' });
  }
});

export default router;