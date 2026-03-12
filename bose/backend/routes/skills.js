/**
 * routes/skills.js
 * Blockchain skill endpoints – ES module, mounted at /api/skill
 *
 * POST  /api/skill/add       – add a skill to the Fabric ledger
 * GET   /api/skill/:skillId  – query a skill from the Fabric ledger
 */

import express from 'express';
import fabricNetwork from '../services/fabricNetwork.js';

const router = express.Router();

// ── POST /api/skill/add ───────────────────────────────────────────────────────
/**
 * Add a skill record to the Hyperledger Fabric ledger.
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
    const { skillId, studentId, studentName, skillName, category, level, issuer, identity } = req.body;

    if (!skillId || !studentId || !skillName || !identity) {
      return res.status(400).json({ error: 'Missing required fields: skillId, studentId, skillName, identity' });
    }

    await fabricNetwork.addSkill(
      identity,
      skillId,
      studentId,
      studentName  || '',
      skillName,
      category     || '',
      level        || '',
      issuer       || ''
    );

    res.status(201).json({ success: true, skillId });
  } catch (err) {
    console.error('skill/add error:', err);
    res.status(500).json({ error: 'Failed to add skill', details: err.message });
  }
});

// ── GET /api/skill/:skillId ───────────────────────────────────────────────────
/**
 * Query a skill record from the Fabric ledger.
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

    const result = await fabricNetwork.querySkill(identity, skillId);
    res.json({ success: true, skill: JSON.parse(result) });
  } catch (err) {
    console.error('skill/get error:', err);
    res.status(404).json({ error: 'Skill not found', details: err.message });
  }
});

export default router;
