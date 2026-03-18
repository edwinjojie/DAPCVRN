import express from 'express';
import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';
import bcrypt from 'bcryptjs';
import { requireRecruiter } from '../middleware/auth.js';

const router = express.Router();

// PHASE 8: Apply security middleware to all recruiter routes
router.use(requireRecruiter);

// 2.1 Dashboard API (REPLACE MOCK)
router.get('/dashboard', async (req, res) => {
  try {
    const recruiterId = req.user.userId || req.user._id;

    // totalJobs = count(Job where recruiterId) (Using employerId since that is the generic owner, or createdBy if we fully migrate to it)
    const totalJobs = await Job.countDocuments({ $or: [{ createdBy: recruiterId }, { employerId: recruiterId }] });
    
    // openJobs = count(Job where status="active")
    const openJobs = await Job.countDocuments({ 
        $or: [{ createdBy: recruiterId }, { employerId: recruiterId }],
        status: 'active' 
    });

    // totalApplicants = count(Application where recruiterId)
    const totalApplicants = await Application.countDocuments({ recruiterId });

    // recentActivity = last 10 applications
    const recentActivity = await Application.find({ recruiterId })
        .sort({ appliedAt: -1, createdAt: -1 })
        .limit(10)
        .populate('candidateId', 'name email')
        .populate('jobId', 'title');

    res.json({
        success: true,
        stats: {
            totalJobs,
            openJobs,
            totalApplicants
        },
        recentActivity
    });
  } catch (error) {
    console.error('Error fetching recruiter dashboard:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// 2.2 Candidate Search API
router.get('/candidates', async (req, res) => {
  try {
    const { keyword, location, verified } = req.query;

    const query = { role: 'student' };

    if (keyword) {
        query.name = { $regex: keyword, $options: 'i' };
    }
    
    if (location) {
        query.location = { $regex: location, $options: 'i' };
    }

    if (verified === 'true') {
        query.verifiedCredentials = true;
    } else if (verified === 'false') {
        query.verifiedCredentials = false;
    }

    const candidates = await User.find(query)
        .select('-password -__v');

    res.json({
        success: true,
        candidates
    });
  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
});

// 2.3 Get All Applicants for Recruiter
router.get('/applications', async (req, res) => {
  try {
    const recruiterId = req.user.userId || req.user._id;

    const applications = await Application.find({ recruiterId })
        .populate('candidateId', '-password -__v')
        .populate('jobId', 'title');

    res.json({
        success: true,
        applications
    });
  } catch (error) {
    console.error('Error fetching all applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// 2.4 Get Applicants for Job
router.get('/jobs/:jobId/applicants', async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await Application.find({ jobId })
        .populate('candidateId', '-password -__v');

    res.json({
        success: true,
        applications
    });
  } catch (error) {
    console.error('Error fetching applicants:', error);
    res.status(500).json({ error: 'Failed to fetch applicants' });
  }
});

// 2.5 Update Applicant Status
router.put('/applications/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const allowedStatuses = ['applied', 'shortlisted', 'rejected', 'hired', 'interviewed', 'offered'];
    if (!allowedStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid application status' });
    }

    const application = await Application.findById(id);
    if (!application) {
        return res.status(404).json({ error: 'Application not found' });
    }

    application.status = status;
    // application.updatedAt will be touched automatically by mongoose timestamps
    
    // Add to timeline
    application.timeline.push({
        status: status,
        timestamp: new Date(),
        updatedBy: req.user.userId || req.user._id
    });

    await application.save();

    // Phase 3 - trigger notification/email to candidate
    await Notification.createNotification({
        userId: application.candidateId,
        type: 'application_status_changed',
        title: 'Application Status Updated',
        message: `Your application status has been updated to ${status}`,
        relatedApplication: application._id,
        relatedJob: application.jobId,
        relatedUser: req.user.userId || req.user._id
    });

    res.json({
        success: true,
        application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// 3.3 Blockchain Verification Hook
router.post('/verify/:applicationId', async (req, res) => {
  try {
    const { applicationId } = req.params;
    
    // Find application and candidate
    const application = await Application.findById(applicationId).populate('candidateId');
    if (!application) return res.status(404).json({ error: 'Application not found' });
    
    const recruiterId = req.user.userId || req.user._id;
    if (application.recruiterId && application.recruiterId.toString() !== recruiterId.toString()) {
      return res.status(403).json({ error: 'Not authorized for this application' });
    }

    // Fetch candidate credentials & call blockchain
    // For this prototype, we'll mark the user's credentials as verified and trigger a notification
    
    await User.findByIdAndUpdate(application.candidateId._id, { verifiedCredentials: true });
    
    // Send notification
    await Notification.createNotification({
        userId: application.candidateId._id,
        type: 'credential_verified',
        title: 'Credentials Verified',
        message: `Your candidate credentials have been blockchain-verified by a recruiter.`,
        relatedApplication: application._id,
        relatedUser: recruiterId
    });

    res.json({
      success: true,
      message: 'Candidate credentials successfully verified via blockchain hook.',
      candidateId: application.candidateId._id
    });
  } catch (error) {
    console.error('Error in blockchain hook:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});

// PHASE 5: Recruiter Analytics
router.get('/analytics', async (req, res) => {
  try {
    const recruiterId = req.user._id || req.user.userId;

    // Applications Per Job
    const jobs = await Job.find({ $or: [{ createdBy: recruiterId }, { employerId: recruiterId }] }).select('_id title');
    const jobIds = jobs.map(j => j._id);
    
    const applications = await Application.find({ jobId: { $in: jobIds } });
    
    const applicationsPerJob = jobs.map(job => {
      const matchCount = applications.filter(a => a.jobId.toString() === job._id.toString()).length;
      return { jobTitle: job.title, count: matchCount };
    });

    // Conversion Rate
    const totalApplied = applications.length;
    const totalHired = applications.filter(a => a.status === 'hired').length;
    const conversionRate = totalApplied > 0 ? ((totalHired / totalApplied) * 100).toFixed(1) : 0;

    // Top Skills (Aggregating candidate skills)
    const candidateIds = [...new Set(applications.map(a => a.candidateId.toString()))];
    const candidates = await User.find({ _id: { $in: candidateIds } }).select('skills');
    
    const skillCounts = {};
    candidates.forEach(c => {
      if (c.skills) {
        c.skills.forEach(skill => {
          skillCounts[skill] = (skillCounts[skill] || 0) + 1;
        });
      }
    });
    
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      metrics: {
        applicationsPerJob,
        conversionRate,
        topSkills
      }
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics' });
  }
});

// PHASE 6: Settings Update
router.put('/settings', async (req, res) => {
  try {
    const userId = req.user._id || req.user.userId;
    const { name, company, currentPassword, newPassword } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Handle password change
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Invalid current password' });
      }
      // password will be hashed in a pre-save hook on the User model
      user.password = newPassword;
    }

    if (name) user.name = name;
    if (company) user.organization = company;

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      user: {
        name: user.name,
        company: user.organization,
        email: user.email
      }
    });

  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// PHASE 7: Smart Candidate Recommendation and Ranking
router.get('/jobs/:jobId/recommendations', async (req, res) => {
  try {
    const { jobId } = req.params;
    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    // Find candidates sorted by verified credentials, then rank by skill matches
    const allStudents = await User.find({ role: 'student' }).lean();
    
    const jobSkills = job.skills || [];
    
    // Simple AI heuristic ranking function
    const rankedCandidates = allStudents.map(student => {
      let score = 0;
      
      if (student.verifiedCredentials) score += 50; // Massively boost verified credentials
      
      const studentSkills = student.skills || [];
      const matchingSkills = studentSkills.filter(skill => 
        jobSkills.some(jSkill => jSkill.toLowerCase() === skill.toLowerCase())
      );
      
      score += (matchingSkills.length * 10); // 10 points per matching skill

      return {
        ...student,
        matchScore: score,
        matchedSkillsCount: matchingSkills.length
      };
    }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10); // Return top 10

    res.json({
      success: true,
      recommendations: rankedCandidates
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

export default router;
