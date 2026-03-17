import { analyzeSkillGap, matchCandidatesToJob } from '../services/aiService.js';
import { Job, Profile, Credential } from '../models/index.js';

/**
 * POST /api/ai/skill-gap
 * Body: { targetRole: string, jobId?: string }
 * Uses the authenticated user's profile skills to analyse the gap.
 */
export async function getSkillGap(req, res) {
  try {
    const userId = req.user?.userId || req.user?.id;
    const { targetRole, jobId } = req.body;

    if (!targetRole) {
      return res.status(400).json({ error: 'targetRole is required' });
    }

    // Load candidate profile skills
    const profile = await Profile.findOne({ userId }).lean();
    const profileSkills = (profile?.skills || []).map(s =>
      typeof s === 'string' ? s : s.name
    );

    // Also load skills from the candidate's verified/issued credentials
    const credentials = await Credential.find({
      userId,
      status: { $in: ['issued', 'verified', 'pending'] }
    }).select('skills title type course').lean();

    const credentialSkills = credentials.flatMap(c => c.skills || []);

    // Also infer skill names from credential titles/courses (e.g. "React Certification" → "React")
    const credentialTitles = credentials
      .map(c => c.title || c.course || '')
      .filter(Boolean);

    // Merge and deduplicate all skills (case-insensitive)
    const allSkillsRaw = [...profileSkills, ...credentialSkills, ...credentialTitles];
    const seen = new Set();
    const candidateSkills = [];
    for (const skill of allSkillsRaw) {
      const lower = skill.toLowerCase().trim();
      if (lower && !seen.has(lower)) {
        seen.add(lower);
        candidateSkills.push(skill.trim());
      }
    }

    // If a specific jobId is given, load its required skills
    let jobSkills = [];
    if (jobId) {
      const job = await Job.findById(jobId).lean();
      if (job) {
        jobSkills = job.skills || [];
      }
    }

    const analysis = await analyzeSkillGap(candidateSkills, targetRole, jobSkills);

    res.json({
      success: true,
      candidateSkills,
      analysis
    });
  } catch (error) {
    console.error('Skill gap controller error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze skill gap' });
  }
}

/**
 * GET /api/ai/recommend-candidates/:jobId
 * Returns AI-ranked candidates for the given job.
 */
export async function getRecommendedCandidates(req, res) {
  try {
    const { jobId } = req.params;
    const userId = req.user?.userId || req.user?.id;

    // Verify the job exists and belongs to the recruiter
    const job = await Job.findById(jobId).lean();
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }
    if (job.employerId?.toString() !== userId) {
      return res.status(403).json({ error: 'You can only get recommendations for your own jobs' });
    }

    // Fetch all candidate profiles (students)
    // We join with User to filter only student role
    const { User } = await import('../models/index.js');
    const students = await User.find({ role: 'student' }).select('_id').lean();
    const studentIds = students.map(s => s._id);

    const profiles = await Profile.find({ userId: { $in: studentIds } }).lean();

    if (profiles.length === 0) {
      return res.json({
        success: true,
        job: { id: job._id, title: job.title },
        candidates: [],
        message: 'No candidate profiles found in the system'
      });
    }

    const rankedCandidates = await matchCandidatesToJob(job, profiles);

    res.json({
      success: true,
      job: { id: job._id, title: job.title, skills: job.skills },
      candidates: rankedCandidates
    });
  } catch (error) {
    console.error('Recommend candidates controller error:', error);
    res.status(500).json({ error: error.message || 'Failed to recommend candidates' });
  }
}
