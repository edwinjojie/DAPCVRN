/**
 * routes/skills.js
 * Blockchain skill endpoints – ES module, mounted at /api/skill
 *
 * POST  /api/skill/add       – add a skill to MongoDB + Fabric ledger
 * GET   /api/skill/:skillId  – query a skill (MongoDB first, then Fabric)
 * GET   /api/skill/           – list all skills from MongoDB
 */

import express from 'express';
import fabricNetwork from '../services/fabricNetwork.js';
import BlockchainSkill from '../models/BlockchainSkill.js';
import SkillVerificationRequest from '../models/SkillVerificationRequest.js';
import { User, Notification } from '../models/index.js';

const router = express.Router();

// ── GET /api/skill/ ───────────────────────────────────────────────────────────
/**
 * List all skill records stored in MongoDB.
 * Query params:
 *   studentId – optional, filter by studentId
 */
router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.studentId) query.studentId = req.query.studentId;

    const skills = await BlockchainSkill.find(query).sort({ createdAt: -1 }).lean();
    res.json({ success: true, skills, count: skills.length });
  } catch (err) {
    console.error('skill/list error:', err);
    res.status(500).json({ error: 'Failed to retrieve skills', details: err.message });
  }
});

// ── POST /api/skill/add ───────────────────────────────────────────────────────
/**
 * Add a skill record to MongoDB and the Hyperledger Fabric ledger.
 * MongoDB is written first (status PENDING); updated to ADDED on success
 * or FAILED if the Fabric transaction errors.
 *
 * Body (JSON):
 *   skillId     – unique skill ID (e.g. "SK_001")
 *   studentId   – string
 *   studentName – string
 *   skillName   – string
 *   category    – string (e.g. "Programming")
 *   level       – string (e.g. "Advanced")
 *   issuer      – string (issuing organisation)
 *   identity    – Fabric wallet identity to use (e.g. "college_xyz")
 */
router.post('/add', async (req, res) => {
  try {
    const { skillId, studentId, studentName, skillName, category, level, issuer, identity, role } = req.body;

    if (!skillId || !studentId || !skillName || !identity) {
      return res.status(400).json({ error: 'Missing required fields: skillId, studentId, skillName, identity' });
    }

    // Default role to 'institution' – the chaincode only allows
    // ['institution', 'employer', 'training_center', 'admin']
    const fabricRole = role || 'institution';

    // 1. Save to MongoDB with PENDING status
    let skillRecord;
    try {
      skillRecord = await BlockchainSkill.create({
        skillId,
        studentId,
        studentName: studentName || '',
        skillName,
        category:   category || '',
        level:      level    || '',
        issuer:     issuer   || '',
        status:     'PENDING'
      });
    } catch (dbErr) {
      // Duplicate key – skill already exists, update it
      if (dbErr.code === 11000) {
        skillRecord = await BlockchainSkill.findOne({ skillId });
      } else {
        throw dbErr;
      }
    }

    // 2. Attempt Fabric ledger write
    let fabricError = null;
    try {
      await fabricNetwork.addSkill(
        identity,
        fabricRole,
        skillId,
        studentId,
        studentName  || '',
        skillName,
        category     || '',
        level        || '',
        issuer       || ''
      );
      // Update MongoDB status to ADDED
      skillRecord.status = 'ADDED';
      await skillRecord.save();
      console.log(`✅ Skill ${skillId} added to Fabric ledger and MongoDB`);
    } catch (fabricErr) {
      console.warn(`⚠️ Fabric addSkill failed for ${skillId}: ${fabricErr.message}`);
      fabricError = fabricErr.message;
      // Update MongoDB with FAILED status but still respond 201 so the skill is tracked
      skillRecord.status = 'FAILED';
      skillRecord.errorMessage = fabricErr.message;
      await skillRecord.save();
    }

    res.status(201).json({
      success:       true,
      skillId,
      mongoStatus:   skillRecord.status,
      fabricWritten: !fabricError,
      ...(fabricError && { fabricError })
    });
  } catch (err) {
    console.error('skill/add error:', err);
    res.status(500).json({ error: 'Failed to add skill', details: err.message });
  }
});

// ── GET /api/skill/:skillId ───────────────────────────────────────────────────
/**
 * Query a skill record – checks MongoDB first, then falls back to Fabric.
 *
 * Route params:
 *   skillId – skill ID to query
 *
 * Query params:
 *   identity – optional Fabric wallet identity (defaults to 'college_xyz')
 */
router.get('/:skillId', async (req, res) => {
  try {
    const { skillId } = req.params;
    const identity    = req.query.identity || 'college_xyz';

    // 1. Try MongoDB first (fast, offline-capable)
    const mongoSkill = await BlockchainSkill.findOne({ skillId }).lean();
    if (mongoSkill) {
      return res.json({ success: true, skill: mongoSkill, source: 'mongodb' });
    }

    // 2. Fall back to Fabric ledger
    const result = await fabricNetwork.querySkill(identity, skillId);
    res.json({ success: true, skill: JSON.parse(result), source: 'fabric' });
  } catch (err) {
    console.error('skill/get error:', err);
    res.status(404).json({ error: 'Skill not found', details: err.message });
  }
});

// ── POST /api/skill/request-verification ──────────────────────────────────────
/**
 * Student requests institution verification for a skill.
 *
 * Body (JSON):
 *   skillId          – the MongoDB _id or skillId string of the BlockchainSkill
 *   institutionName  – name/organization of the institution to verify
 */
router.post('/request-verification', async (req, res) => {
  try {
    const { skillId, institutionName } = req.body;

    if (!skillId || !institutionName) {
      return res.status(400).json({ error: 'Missing required fields: skillId, institutionName' });
    }

    // Find the skill record
    const mongoose = (await import('mongoose')).default;
    const query = mongoose.isValidObjectId(skillId)
      ? { $or: [{ _id: skillId }, { skillId }] }
      : { skillId };
    const skill = await BlockchainSkill.findOne(query);
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    if (skill.verificationStatus === 'pending') {
      return res.status(400).json({ error: 'Verification already requested for this skill' });
    }
    if (skill.verificationStatus === 'verified') {
      return res.status(400).json({ error: 'Skill is already verified' });
    }

    // Find the institution user by organization (case-insensitive)
    const institution = await User.findOne({
      role: { $in: ['university', 'institution', 'verifier'] },
      organization: { $regex: new RegExp(`^${institutionName.trim()}$`, 'i') }
    });
    if (!institution) {
      return res.status(404).json({ error: `Institution "${institutionName}" not found` });
    }

    // Find the requester (student)
    const requester = await User.findOne({ _id: skill.studentId }).catch(() => null)
      || await User.findOne({ userId: skill.studentId }).catch(() => null);

    // Create the SkillVerificationRequest
    const svr = await SkillVerificationRequest.create({
      skillId: skill._id,
      requesterId: requester?._id || skill.studentId,
      verifierId: institution._id,
      status: 'pending'
    });

    // Update blockchainSkill verificationStatus
    skill.verificationStatus = 'pending';
    skill.verifierId = institution._id;
    await skill.save();

    // Create a notification for the institution
    try {
      await Notification.createNotification({
        userId: institution._id,
        type: 'skill_verification_request',
        title: 'Skill Verification Request',
        message: `${skill.studentName || 'A student'} has requested verification for the skill "${skill.skillName}".`,
        priority: 'medium',
        relatedUser: requester?._id || undefined,
        actionUrl: '/verification-requests',
        actionText: 'Review Request'
      });
    } catch (notifErr) {
      console.warn('Failed to create notification:', notifErr.message);
    }

    res.status(201).json({
      success: true,
      message: 'Verification request submitted',
      requestId: svr._id,
      skillId: skill.skillId,
      verificationStatus: 'pending',
      institution: institution.organization
    });
  } catch (err) {
    console.error('skill/request-verification error:', err);
    res.status(500).json({ error: 'Failed to submit verification request', details: err.message });
  }
});

export default router;
