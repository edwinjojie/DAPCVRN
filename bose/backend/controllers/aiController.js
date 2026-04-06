import { analyzeSkillGap, matchCandidatesToJob } from '../services/aiService.js';
import { Job, Profile, Credential, User, BlockchainSkill } from '../models/index.js';

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
    const isOwner = (
      String(job.employerId) === String(userId) ||
      String(job.createdBy) === String(userId)
    );
    // In development / demo mode allow any recruiter to get recommendations
    const isDemoMode = process.env.NODE_ENV !== 'production';
    if (!isOwner && !isDemoMode) {
      return res.status(403).json({ error: 'You can only get recommendations for your own jobs' });
    }

    // Fetch all candidate profiles (students)
    const students = await User.find({ role: 'student' }).select('_id name email skills').lean();
    const studentIds = students.map(s => s._id);

    const profiles = await Profile.find({ userId: { $in: studentIds } }).lean();

    // Also fetch credentials and blockchain skills for richer matching
    const credentials = await Credential.find({
      userId: { $in: studentIds },
      status: { $in: ['issued', 'verified'] }
    }).select('userId skills title type course').lean();

    const blockchainSkills = await BlockchainSkill.find({
      studentId: { $in: studentIds.map(id => id.toString()) }
    }).select('studentId skillName').lean();

    // Build a credential skills map per student
    const credSkillMap = {};
    credentials.forEach(c => {
      const uid = c.userId.toString();
      if (!credSkillMap[uid]) credSkillMap[uid] = [];
      (c.skills || []).forEach(s => credSkillMap[uid].push(s));
      if (c.title) credSkillMap[uid].push(c.title);
    });

    const bcSkillMap = {};
    blockchainSkills.forEach(s => {
      const uid = s.studentId.toString();
      if (!bcSkillMap[uid]) bcSkillMap[uid] = [];
      if (s.skillName) bcSkillMap[uid].push(s.skillName);
    });

    // Build a student name map
    const studentMap = {};
    students.forEach(s => { studentMap[s._id.toString()] = s; });

    // Enrich profiles with all skill sources
    const enrichedProfiles = profiles.map(p => {
      const uid = p.userId.toString();
      const student = studentMap[uid] || {};
      const profileSkills = (p.skills || []).map(s => typeof s === 'string' ? s : s.name);
      const extraCredSkills = credSkillMap[uid] || [];
      const extraBcSkills = bcSkillMap[uid] || [];
      const userSkills = student.skills || [];

      // Deduplicate skills
      const seen = new Set();
      const allSkills = [];
      [...profileSkills, ...userSkills, ...extraCredSkills, ...extraBcSkills].forEach(sk => {
        const lower = sk.toLowerCase().trim();
        if (lower && !seen.has(lower)) {
          seen.add(lower);
          allSkills.push({ name: sk.trim() });
        }
      });

      return {
        ...p,
        firstName: p.firstName || student.name?.split(' ')[0] || '',
        lastName: p.lastName || student.name?.split(' ').slice(1).join(' ') || '',
        skills: allSkills
      };
    });

    // Also handle students without profiles — create pseudo-profiles
    const profiledUserIds = new Set(profiles.map(p => p.userId.toString()));
    students.forEach(s => {
      const uid = s._id.toString();
      if (!profiledUserIds.has(uid)) {
        const userSkills = s.skills || [];
        const extraCredSkills = credSkillMap[uid] || [];
        const extraBcSkills = bcSkillMap[uid] || [];
        const seen = new Set();
        const allSkills = [];
        [...userSkills, ...extraCredSkills, ...extraBcSkills].forEach(sk => {
          const lower = sk.toLowerCase().trim();
          if (lower && !seen.has(lower)) {
            seen.add(lower);
            allSkills.push({ name: sk.trim() });
          }
        });
        if (allSkills.length > 0) {
          enrichedProfiles.push({
            _id: uid,
            userId: s._id,
            firstName: s.name?.split(' ')[0] || '',
            lastName: s.name?.split(' ').slice(1).join(' ') || '',
            skills: allSkills,
            yearsOfExperience: 0,
            headline: ''
          });
        }
      }
    });

    if (enrichedProfiles.length === 0) {
      return res.json({
        success: true,
        job: { id: job._id, title: job.title },
        candidates: [],
        message: 'No candidate profiles found in the system'
      });
    }

    const rankedCandidates = await matchCandidatesToJob(job, enrichedProfiles);

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
