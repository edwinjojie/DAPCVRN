/**
 * routes/candidateProfile.js
 * Full CRUD profile management for students/candidates – DB-backed
 * Mounted at /api/candidate/profile
 */
import express from 'express';
import Joi from 'joi';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Profile from '../models/Profile.js';
import User from '../models/User.js';

const router = express.Router();

// Resume upload config
const resumeStorage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const dir = path.join(process.cwd(), 'backend', 'uploads', 'resumes');
    await fs.promises.mkdir(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  }
});
const resumeUpload = multer({
  storage: resumeStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error('Only PDF, DOC, DOCX files are allowed'));
  }
});

// ── Validation ────────────────────────────────────────────────────────────────
const profileUpdateSchema = Joi.object({
  firstName: Joi.string().trim().max(100).allow(''),
  lastName: Joi.string().trim().max(100).allow(''),
  dateOfBirth: Joi.date().iso().allow(null),
  gender: Joi.string().valid('male', 'female', 'other', 'prefer-not-to-say').allow(null, ''),
  nationality: Joi.string().max(100).allow(null, ''),
  phone: Joi.string().max(20).allow(null, ''),
  alternateEmail: Joi.string().email().allow(null, ''),
  address: Joi.object({
    street: Joi.string().allow(''),
    city: Joi.string().allow(''),
    state: Joi.string().allow(''),
    country: Joi.string().allow(''),
    zipCode: Joi.string().allow('')
  }).allow(null),
  headline: Joi.string().trim().max(200).allow(''),
  bio: Joi.string().max(2000).allow(''),
  currentPosition: Joi.string().max(200).allow(null, ''),
  currentCompany: Joi.string().max(200).allow(null, ''),
  yearsOfExperience: Joi.number().min(0).max(60).allow(null),
  skills: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    level: Joi.string().valid('beginner', 'intermediate', 'advanced', 'expert').default('intermediate'),
    yearsOfExperience: Joi.number().min(0).default(0),
    verified: Joi.boolean().default(false)
  })),
  education: Joi.array().items(Joi.object({
    institution: Joi.string().required(),
    degree: Joi.string().required(),
    fieldOfStudy: Joi.string().allow(''),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(null),
    grade: Joi.string().allow(''),
    description: Joi.string().allow(''),
    current: Joi.boolean().default(false)
  })),
  experience: Joi.array().items(Joi.object({
    company: Joi.string().required(),
    position: Joi.string().required(),
    location: Joi.string().allow(''),
    startDate: Joi.date().iso().required(),
    endDate: Joi.date().iso().allow(null),
    current: Joi.boolean().default(false),
    description: Joi.string().allow(''),
    achievements: Joi.array().items(Joi.string())
  })),
  certifications: Joi.array().items(Joi.object({
    name: Joi.string().required(),
    issuer: Joi.string().required(),
    issueDate: Joi.date().iso().allow(null),
    expiryDate: Joi.date().iso().allow(null),
    credentialId: Joi.string().allow(''),
    credentialUrl: Joi.string().uri().allow('')
  })),
  projects: Joi.array().items(Joi.object({
    title: Joi.string().required(),
    description: Joi.string().allow(''),
    url: Joi.string().uri().allow(''),
    startDate: Joi.date().iso().allow(null),
    endDate: Joi.date().iso().allow(null),
    technologies: Joi.array().items(Joi.string()),
    current: Joi.boolean().default(false)
  })),
  socialLinks: Joi.object({
    linkedin: Joi.string().uri().allow(''),
    github: Joi.string().uri().allow(''),
    twitter: Joi.string().uri().allow(''),
    portfolio: Joi.string().uri().allow(''),
    other: Joi.array().items(Joi.object({
      platform: Joi.string(),
      url: Joi.string().uri()
    }))
  }).allow(null),
  preferences: Joi.object({
    jobType: Joi.array().items(Joi.string().valid('full-time', 'part-time', 'contract', 'internship', 'temporary')),
    workLocation: Joi.array().items(Joi.string().valid('onsite', 'remote', 'hybrid')),
    desiredSalary: Joi.object({
      min: Joi.number().min(0),
      max: Joi.number().min(0),
      currency: Joi.string().default('USD')
    }),
    willingToRelocate: Joi.boolean(),
    availableFrom: Joi.date().iso().allow(null)
  }).allow(null),
  privacy: Joi.object({
    profileVisibility: Joi.string().valid('public', 'private', 'connections-only'),
    showEmail: Joi.boolean(),
    showPhone: Joi.boolean(),
    allowMessages: Joi.boolean()
  }).allow(null),
  // Legacy flat fields (from old frontend)
  name: Joi.string().allow(''),
  email: Joi.string().email().allow(''),
  visibility: Joi.boolean()
}).unknown(false);

// ── GET /api/candidate/profile ────────────────────────────────────────────────
// Returns the student's profile. Auto-creates a skeleton if none exists.
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    let profile = await Profile.findOne({ userId }).lean();

    if (!profile) {
      // Auto-create skeleton from User record
      let userRecord = null;
      try { userRecord = await User.findById(userId).lean(); } catch (e) { /* ignore */ }

      const nameParts = (userRecord?.name || '').split(' ');
      const newProfile = new Profile({
        userId,
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        alternateEmail: userRecord?.email || '',
        skills: (userRecord?.skills || []).map(s => ({ name: s, level: 'intermediate', yearsOfExperience: 0, verified: false })),
      });
      await newProfile.save();
      profile = newProfile.toObject();
    }

    // Merge user data for convenience
    let user = null;
    try { user = await User.findById(userId).select('name email role organization').lean(); } catch (e) { /* ignore */ }

    res.json({
      ...profile,
      // Legacy flat fields for backward compat
      name: user?.name || `${profile.firstName} ${profile.lastName}`.trim(),
      email: user?.email || profile.alternateEmail || '',
      visibility: profile.privacy?.profileVisibility === 'public',
      resumeURL: profile.resume?.url || null,
    });
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── PUT /api/candidate/profile ────────────────────────────────────────────────
// Update profile (partial update supported)
router.put('/', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { error: validationError, value } = profileUpdateSchema.validate(req.body, { stripUnknown: true });
    if (validationError) {
      return res.status(400).json({ error: validationError.details[0].message });
    }

    // Handle legacy flat fields
    if (value.name && !value.firstName) {
      const parts = value.name.split(' ');
      value.firstName = parts[0] || '';
      value.lastName = parts.slice(1).join(' ') || '';
    }
    if (value.visibility !== undefined && !value.privacy) {
      value.privacy = { profileVisibility: value.visibility ? 'public' : 'private' };
    }
    // Remove legacy keys before saving to Profile model
    delete value.name;
    delete value.email;
    delete value.visibility;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: value },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Also update User.skills if skills were provided
    if (value.skills && value.skills.length > 0) {
      try {
        await User.findByIdAndUpdate(userId, {
          $set: { skills: value.skills.map(s => s.name) }
        });
      } catch (e) { console.warn('Failed to sync skills to User model:', e); }
    }

    let user = null;
    try { user = await User.findById(userId).select('name email').lean(); } catch (e) { /* ignore */ }

    res.json({
      ...profile,
      name: user?.name || `${profile.firstName} ${profile.lastName}`.trim(),
      email: user?.email || profile.alternateEmail || '',
      visibility: profile.privacy?.profileVisibility === 'public',
      resumeURL: profile.resume?.url || null,
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── POST (legacy) – redirect to PUT ──────────────────────────────────────────
router.post('/', async (req, res) => {
  // Forward to PUT handler for backward compatibility
  req.method = 'PUT';
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const value = req.body;

    // Handle legacy flat fields
    const updateData = { ...value };
    if (updateData.name && !updateData.firstName) {
      const parts = updateData.name.split(' ');
      updateData.firstName = parts[0] || '';
      updateData.lastName = parts.slice(1).join(' ') || '';
    }
    if (updateData.visibility !== undefined && !updateData.privacy) {
      updateData.privacy = { profileVisibility: updateData.visibility ? 'public' : 'private' };
    }
    if (updateData.skills && Array.isArray(updateData.skills) && typeof updateData.skills[0] === 'string') {
      updateData.skills = updateData.skills.map(s => ({ name: s, level: 'intermediate', yearsOfExperience: 0, verified: false }));
    }
    delete updateData.name;
    delete updateData.email;
    delete updateData.visibility;

    const profile = await Profile.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true, runValidators: true }
    ).lean();

    // Sync skills
    if (updateData.skills) {
      try {
        await User.findByIdAndUpdate(userId, {
          $set: { skills: updateData.skills.map(s => typeof s === 'string' ? s : s.name) }
        });
      } catch (e) { /* ignore */ }
    }

    let user = null;
    try { user = await User.findById(userId).select('name email').lean(); } catch (e) { /* ignore */ }

    res.json({
      ...profile,
      name: user?.name || `${profile.firstName} ${profile.lastName}`.trim(),
      email: user?.email || profile.alternateEmail || '',
      visibility: profile.privacy?.profileVisibility === 'public',
      skills: (profile.skills || []).map(s => typeof s === 'object' ? s.name : s),
      resumeURL: profile.resume?.url || null,
    });
  } catch (error) {
    console.error('Error updating profile (POST):', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ── POST /api/candidate/profile/resume ────────────────────────────────────────
router.post('/resume', resumeUpload.single('resume'), async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!req.file) return res.status(400).json({ error: 'Resume file is required' });

    const resumeData = {
      filename: req.file.originalname,
      url: `/uploads/resumes/${req.file.filename}`,
      uploadedAt: new Date()
    };

    await Profile.findOneAndUpdate(
      { userId },
      { $set: { resume: resumeData } },
      { upsert: true }
    );

    res.json({ success: true, resume: resumeData });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({ error: 'Failed to upload resume' });
  }
});

// ── GET /api/candidate/profile/completeness ───────────────────────────────────
router.get('/completeness', async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const profile = await Profile.findOne({ userId }).lean();
    res.json({ completeness: profile?.completeness || 0 });
  } catch (error) {
    console.error('Error fetching completeness:', error);
    res.status(500).json({ error: 'Failed to fetch completeness' });
  }
});

export default router;
