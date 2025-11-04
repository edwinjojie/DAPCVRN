import express from 'express';
import { Job } from '../models/index.js';

const router = express.Router();

// Get jobs for current user (recruiter) - Now using MongoDB
router.get('/my', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    // Get jobs posted by this recruiter
    const jobs = await Job.find({ employerId: userId })
      .populate('companyId', 'name logo')
      .sort({ createdAt: -1 })
      .lean();

    // Transform _id to id for frontend compatibility
    const transformedJobs = jobs.map(job => ({
      ...job,
      id: job._id.toString(),
      applicantsCount: job.totalApplications || 0,
      _id: undefined
    }));

    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Create new job - Now using MongoDB
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { title, description, location, status, companyId, requirements, salary, type, company } = req.body;

    if (!title) return res.status(400).json({ error: 'Title is required' });
    if (!description) return res.status(400).json({ error: 'Description is required' });
    if (!location) return res.status(400).json({ error: 'Location is required' });

    const normalizedStatus = ['active', 'closed', 'draft'].includes((status || '').toLowerCase())
      ? (status || '').toLowerCase()
      : 'draft';

    // Get user's organization name for company field
    const User = (await import('../models/index.js')).User;
    const user = await User.findById(userId).lean();
    const companyName = company || user?.organization || 'Company';

    const job = await Job.create({
      jobId: `JOB-${Date.now()}`,
      title,
      description,
      location,
      status: normalizedStatus,
      employerId: userId,
      company: companyName,
      companyId: companyId || null,
      requirements: requirements || '',
      salary: salary || {},
      employmentType: type || 'full-time',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const populated = await Job.findById(job._id).populate('companyId', 'name logo').lean();

    res.status(201).json({
      ...populated,
      id: populated._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error creating job:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ error: error.message || 'Failed to create job' });
  }
});

// Update job - Now using MongoDB
router.put('/:id', async (req, res) => {
  try {
    const updates = { ...req.body };
    if (updates.status) {
      const s = String(updates.status).toLowerCase();
      if (!['active', 'closed', 'draft'].includes(s)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      updates.status = s;
    }

    const job = await Job.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).populate('companyId', 'name logo').lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      ...job,
      id: job._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error updating job:', error);
    res.status(500).json({ error: 'Failed to update job' });
  }
});

// Delete job - Now using MongoDB
router.delete('/:id', async (req, res) => {
  try {
    const job = await Job.findByIdAndDelete(req.params.id).lean();

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      ...job,
      id: job._id.toString(),
      _id: undefined
    });
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ error: 'Failed to delete job' });
  }
});

// Public endpoint for browsing jobs (no auth required)
router.get('/public', async (req, res) => {
  try {
    const { status = 'active', limit = 50 } = req.query;

    const jobs = await Job.find({ status })
      .populate('companyId', 'name logo')
      .populate('employerId', 'name')
      .sort({ postedDate: -1 })
      .limit(parseInt(limit))
      .lean();

    const transformedJobs = jobs.map(job => ({
      ...job,
      id: job._id.toString(),
      _id: undefined
    }));

    res.json(transformedJobs);
  } catch (error) {
    console.error('Error fetching public jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

export default router;


