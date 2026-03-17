import express from 'express';
import { getSkillGap, getRecommendedCandidates } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/skill-gap
// Body: { targetRole: "Frontend Developer", jobId?: "optional_mongo_id" }
// Returns AI skill gap analysis for the authenticated candidate
router.post('/skill-gap', getSkillGap);

// GET /api/ai/recommend-candidates/:jobId
// Returns AI-ranked candidates for a specific job (recruiter only)
router.get('/recommend-candidates/:jobId', getRecommendedCandidates);

export default router;
