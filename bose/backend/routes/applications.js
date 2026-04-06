import express from "express";
import { Application, Job } from '../models/index.js';

const router = express.Router();

// Get applications for current user (student/candidate) - Now using MongoDB
router.get("/my", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const applications = await Application.find({ candidateId: userId })
      .populate('jobId', 'title company location status')
      .sort({ appliedDate: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedApps = applications.map(app => ({
      ...app,
      id: app._id.toString(),
      _id: app._id.toString(),
      jobTitle: app.jobId?.title || app.title || 'Unknown Job',
      companyName: app.jobId?.company || 'Unknown Company',
      title: app.jobId?.title || app.title || 'Unknown Job',
      appliedAt: app.appliedDate || app.createdAt,
    }));

    res.json(transformedApps);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Get count of active applications (lightweight, for dashboard stats)
router.get("/my/count", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const [total, active] = await Promise.all([
      Application.countDocuments({ candidateId: userId }).catch(() => 0),
      Application.countDocuments({
        candidateId: userId,
        status: { $in: ['submitted', 'under_review', 'interview', 'applied'] }
      }).catch(() => 0),
    ]);

    res.json({ total, active });
  } catch (error) {
    console.error('Error counting applications:', error);
    res.status(500).json({ error: 'Failed to count applications' });
  }
});

// Apply to a job - Now using MongoDB
router.post("/apply/:jobId", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { jobId } = req.params;
    const { title } = req.body;

    // Check if job exists
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Check if already applied
    const existing = await Application.findOne({
      candidateId: userId,
      jobId
    });

    if (existing) {
      return res.status(400).json({ error: 'Already applied to this job' });
    }

    // Get candidate details for required fields
    const User = (await import('../models/User.js')).default;
    const candidateUser = await User.findById(userId).select('name email').lean();

    // Create application
    const application = await Application.create({
      applicationId: `APP-${Date.now()}`,
      jobId,
      candidateId: userId,
      candidateName: candidateUser?.name || req.user?.name || 'Unknown',
      candidateEmail: candidateUser?.email || req.user?.email || 'unknown@example.com',
      status: 'submitted',
      appliedDate: new Date(),
      timeline: [{
        status: 'submitted',
        date: new Date(),
        note: 'Application submitted'
      }]
    });

    const populated = await Application.findById(application._id)
      .populate('jobId', 'title company location')
      .lean();

    res.status(201).json({
      ...populated,
      id: populated._id.toString(),
      _id: populated._id.toString(),
      jobTitle: populated.jobId?.title || title,
      companyName: populated.jobId?.company || 'Unknown Company',
      title: populated.jobId?.title || title,
      appliedAt: populated.appliedDate,
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

// Withdraw / delete an application
router.delete("/:id", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const app = await Application.findById(req.params.id);
    if (!app) return res.status(404).json({ error: 'Application not found' });
    if (String(app.candidateId) !== String(userId)) {
      return res.status(403).json({ error: 'Forbidden' });
    }

    // Only allow withdrawal of active applications
    if (['accepted', 'rejected'].includes(app.status)) {
      return res.status(400).json({ error: 'Cannot withdraw a finalized application' });
    }

    app.status = 'withdrawn';
    app.timeline.push({ status: 'withdrawn', date: new Date(), note: 'Application withdrawn by candidate' });
    await app.save();

    res.json({ success: true, message: 'Application withdrawn' });
  } catch (error) {
    console.error('Error withdrawing application:', error);
    res.status(500).json({ error: 'Failed to withdraw application' });
  }
});

export default router;
