import express from 'express';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Credential from '../models/Credential.js';
import BlockchainSkill from '../models/BlockchainSkill.js';

const router = express.Router();

// GET /api/candidates/search — Real DB search (replaces hardcoded data)
router.get('/search', async (req, res) => {
  try {
    const { keyword = '', location = '' } = req.query || {};

    const query = { role: 'student' };

    if (keyword) {
      query.$or = [
        { name: { $regex: keyword, $options: 'i' } },
        { skills: { $regex: keyword, $options: 'i' } }
      ];
    }
    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    const users = await User.find(query).select('-password -__v').lean();

    // Enrich with profile data
    const userIds = users.map(u => u._id);
    const profiles = await Profile.find({ userId: { $in: userIds } })
      .select('skills yearsOfExperience headline')
      .lean();
    const profileMap = {};
    profiles.forEach(p => { profileMap[p.userId.toString()] = p; });

    const candidates = users.map(u => {
      const profile = profileMap[u._id.toString()] || {};
      const profileSkills = (profile.skills || []).map(s => typeof s === 'string' ? s : s.name);
      const allSkills = [...new Set([...(u.skills || []), ...profileSkills])];

      return {
        id: u._id,
        name: u.name,
        email: u.email,
        skills: allSkills,
        experience: profile.yearsOfExperience || 0,
        location: u.location || 'Unknown',
        headline: profile.headline || '',
        rating: u.rating || 0
      };
    });

    res.json(candidates);
  } catch (error) {
    console.error('Error searching candidates:', error);
    res.status(500).json({ error: 'Failed to search candidates' });
  }
});

// GET /api/candidates/:id/profile — Full profile for detail modals
router.get('/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password -__v').lean();
    if (!user) return res.status(404).json({ error: 'Candidate not found' });

    const profile = await Profile.findOne({ userId: id }).lean();

    // Get credentials from DB
    const credentials = await Credential.find({
      userId: id,
      status: { $in: ['issued', 'verified', 'pending'] }
    }).select('credentialId title type issuer institution issueDate status course grade').lean();

    // Get blockchain skills
    const skills = await BlockchainSkill.find({ studentId: id.toString() })
      .select('skillName category level verificationStatus issuer')
      .lean();

    const profileSkills = (profile?.skills || []).map(s =>
      typeof s === 'string' ? { name: s, level: 'intermediate' } : s
    );

    // Merge skills from all sources
    const allSkillNames = new Set();
    const mergedSkills = [];

    // Add profile skills
    profileSkills.forEach(s => {
      const key = (s.name || '').toLowerCase();
      if (key && !allSkillNames.has(key)) {
        allSkillNames.add(key);
        mergedSkills.push({ name: s.name, level: s.level || 'intermediate', source: 'profile' });
      }
    });

    // Add blockchain skills
    skills.forEach(s => {
      const key = (s.skillName || '').toLowerCase();
      if (key && !allSkillNames.has(key)) {
        allSkillNames.add(key);
        mergedSkills.push({ name: s.skillName, level: s.level || '', source: 'blockchain', verified: s.verificationStatus === 'verified' });
      }
    });

    // Add user.skills
    (user.skills || []).forEach(s => {
      const key = s.toLowerCase();
      if (!allSkillNames.has(key)) {
        allSkillNames.add(key);
        mergedSkills.push({ name: s, level: 'intermediate', source: 'user' });
      }
    });

    res.json({
      success: true,
      candidate: {
        id: user._id,
        name: user.name,
        email: user.email,
        location: user.location || profile?.address?.city || 'Unknown',
        headline: profile?.headline || '',
        bio: profile?.bio || '',
        experience: profile?.yearsOfExperience || 0,
        education: profile?.education || [],
        certifications: profile?.certifications || [],
        skills: mergedSkills,
        credentials: credentials.map(c => ({
          credentialId: c.credentialId || c._id,
          title: c.title,
          type: c.type,
          issuer: c.issuer || c.institution,
          issueDate: c.issueDate,
          status: c.status,
          course: c.course,
          grade: c.grade
        })),
        socialLinks: profile?.socialLinks || {},
        resume: profile?.resume || null
      }
    });
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    res.status(500).json({ error: 'Failed to fetch candidate profile' });
  }
});

// GET /api/candidates/:id/credentials — Real credentials from DB (replaces hardcoded)
router.get('/:id/credentials', async (req, res) => {
  try {
    const { id } = req.params;

    const credentials = await Credential.find({
      userId: id,
      status: { $in: ['issued', 'verified', 'pending'] }
    }).select('credentialId title type issuer institution issueDate status').lean();

    const blockchainSkills = await BlockchainSkill.find({ studentId: id.toString() })
      .select('skillName category level verificationStatus issuer')
      .lean();

    res.json({
      candidateId: id,
      credentials: credentials.map(c => ({
        credentialId: c.credentialId || c._id,
        type: c.title || c.type,
        issuer: c.issuer || c.institution,
        status: c.status,
        issuedAt: c.issueDate
      })),
      skills: blockchainSkills.map(s => ({
        name: s.skillName,
        category: s.category,
        level: s.level,
        verified: s.verificationStatus === 'verified'
      }))
    });
  } catch (error) {
    console.error('Error fetching candidate credentials:', error);
    res.status(500).json({ error: 'Failed to fetch credentials' });
  }
});

export default router;
