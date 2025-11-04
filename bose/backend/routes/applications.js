import express from "express";
import { Application, Job } from '../models/index.js';

const router = express.Router();

// Get applications for current user (student/candidate) - Now using MongoDB
router.get("/my", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    const applications = await Application.find({ candidateId: userId })
      .populate('jobId', 'title company location status')
      .sort({ appliedDate: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedApps = applications.map(app => ({
      ...app,
      id: app._id.toString(),
      _id: app._id.toString(),
      title: app.jobId?.title || 'Unknown Job'
    }));

    res.json(transformedApps);
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

// Apply to a job - Now using MongoDB
router.post("/apply/:jobId", async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
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

    // Create application
    const application = await Application.create({
      applicationId: `APP-${Date.now()}`,
      jobId,
      candidateId: userId,
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
      title: populated.jobId?.title || title
    });
  } catch (error) {
    console.error('Error submitting application:', error);
    res.status(500).json({ error: 'Failed to submit application' });
  }
});

export default router;


