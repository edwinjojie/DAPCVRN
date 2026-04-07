// Simulated AI Service using heuristic keyword matching

/**
 * Extracts and normalizes alphabetic keywords from text, ignoring stop words.
 */
function extractKeywords(text) {
  if (!text) return [];
  const words = text.toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
  const stopWords = new Set([
    'and', 'the', 'to', 'for', 'of', 'in', 'with', 'a', 'an', 'is', 'on', 'as', 
    'are', 'be', 'at', 'this', 'that', 'we', 'you', 'will', 'our', 'from', 'it', 
    'can', 'have', 'has', 'your', 'or', 'by'
  ]);
  return [...new Set(words.filter(w => w.length > 2 && !stopWords.has(w)))];
}

import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-pro';

/**
 * Analyze the skill gap for a candidate targeting a specific role / job.
 */
export async function analyzeSkillGap(candidateSkills, targetRole, jobSkills = []) {
  let lastError;
  for (const modelName of [GEMINI_MODEL, 'gemini-3-flash-preview', 'gemini-pro']) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      const prompt = `You are an expert career advisor and skills analyst.

A candidate has the following skills: ${candidateSkills.join(', ') || 'none listed'}.

They want to transition into the role of "${targetRole}".
${jobSkills.length > 0 ? `The job specifically requires these skills: ${jobSkills.join(', ')}.` : ''}

Please analyze and return a JSON object with the following structure (ONLY return the JSON, no markdown fences):
{
  "targetRole": "${targetRole}",
  "matchingSkills": ["skills the candidate already has that are relevant"],
  "missingSkills": ["skills the candidate needs to acquire"],
  "recommendations": [
    {
      "skill": "skill name",
      "priority": "high",
      "reason": "why this skill is important for the target role",
      "suggestedResources": ["free course or resource name"]
    }
  ],
  "overallReadiness": <number 0-100>,
  "summary": "A short summary of the candidate's readiness for the role"
}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Strip markdown fences if present
      const cleaned = text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        console.log(`✅ AI skill gap analysis succeeded with model: ${modelName}`);
        return JSON.parse(jsonMatch[0]);
      }

      return {
        targetRole,
        matchingSkills: [],
        missingSkills: [],
        recommendations: [],
        overallReadiness: 0,
        summary: text
      };
    } catch (err) {
      console.warn(`⚠️ AI model ${modelName} failed: ${err.message}`);
      lastError = err;
      // Try the next model in the fallback chain
    }
  }
  throw new Error('Failed to generate skill gap analysis: ' + lastError?.message);
}

/**
 * Match and rank candidates for a specific job based on skills and keywords.
 */
export async function matchCandidatesToJob(job, candidates) {
  try {
    if (!candidates || candidates.length === 0) {
      return [];
    }

    const jobRequiredSkillsLower = (job.skills || []).map(s => String(s).toLowerCase().trim());
    
    // Extract supplementary keywords from job title and description
    const jobKeywords = new Set([
      ...jobRequiredSkillsLower,
      ...extractKeywords(job.title),
      ...extractKeywords(job.description)
    ]);
    
    const results = candidates.map(c => {
      const candidateSkills = (c.skills || []).map(s => (typeof s === 'string' ? s : (s.name || ''))).filter(Boolean);
      const candidateSkillsLower = candidateSkills.map(s => s.toLowerCase().trim());
      
      const candidateKeywords = new Set([
        ...candidateSkillsLower,
        ...extractKeywords(c.headline)
      ]);
      
      let matchCount = 0;
      const matchingSkills = [];
      const missingSkills = [];
      let matchScore = 0;
      
      // If the job explicitly defines required skills, weight them heavily
      if (jobRequiredSkillsLower.length > 0) {
        jobRequiredSkillsLower.forEach(reqSkill => {
          if (candidateSkillsLower.some(cSkill => cSkill.includes(reqSkill) || reqSkill.includes(cSkill))) {
            matchingSkills.push(reqSkill);
            matchCount++;
          } else {
            missingSkills.push(reqSkill);
          }
        });
        
        // Base score up to 80 points from strict requirements
        const strictScore = Math.round((matchCount / jobRequiredSkillsLower.length) * 80);
        
        // Supplementary score up to 20 points from description/headline keyword overlaps
        let keywordOverlap = 0;
        candidateKeywords.forEach(kw => {
          if (jobKeywords.has(kw) && !jobRequiredSkillsLower.includes(kw)) keywordOverlap++;
        });
        const keywordBoost = Math.min(20, keywordOverlap * 2);
        
        matchScore = Math.min(100, strictScore + keywordBoost);
      } else {
        // Fallback: If no explicit job skills, score purely on keyword overlap
        let keywordOverlap = 0;
        jobKeywords.forEach(kw => {
          if (candidateKeywords.has(kw)) {
            keywordOverlap++;
            matchingSkills.push(kw);
          }
        });
        matchScore = jobKeywords.size > 0 ? Math.min(100, Math.round((keywordOverlap / jobKeywords.size) * 100)) : 50;
      }
      
      // Generate summary
      let summary = '';
      if (matchScore >= 80) summary = `Excellent match! Strong overlap with required profile.`;
      else if (matchScore >= 50) summary = `Good potential match, but missing some key requirements.`;
      else summary = `Weak match based on current profile keywords.`;
      
      return {
        candidateId: c._id?.toString() || c.id,
        candidateName: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Unknown Candidate',
        matchScore,
        matchingSkills: matchingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        missingSkills: missingSkills.map(s => s.charAt(0).toUpperCase() + s.slice(1)),
        summary
      };
    });
    
    // Sort descending by score
    return results.sort((a, b) => b.matchScore - a.matchScore);
  } catch (error) {
    console.error('Candidate match heuristic error:', error);
    throw new Error('Failed to match candidates: ' + error.message);
  }
}
