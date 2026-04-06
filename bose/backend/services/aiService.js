import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Valid Gemini model with fallback — gemini-3 doesn't exist yet
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
 * Match and rank candidates for a specific job based on skills.
 */
export async function matchCandidatesToJob(job, candidates) {
  let lastError;
  for (const modelName of [GEMINI_MODEL, 'gemini-1.5-flash', 'gemini-pro']) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });

      // Build a concise snapshot of each candidate
      const candidateSummaries = candidates.map((c, i) => ({
        index: i,
        id: c._id?.toString() || c.id,
        name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || c.name || 'Unknown',
        skills: (c.skills || []).map(s => (typeof s === 'string' ? s : s.name)).filter(Boolean),
        experience: c.yearsOfExperience || 0,
        headline: c.headline || ''
      }));

      if (candidateSummaries.length === 0) {
        return [];
      }

      const prompt = `You are an expert recruiter AI assistant.

Here is a job posting:
- Title: ${job.title}
- Required Skills: ${(job.skills || []).join(', ') || 'any'}
- Description: ${(job.description || 'N/A').substring(0, 500)}
- Experience Level: ${job.experienceLevel || 'any'}

Here are the available candidates (as JSON):
${JSON.stringify(candidateSummaries, null, 2)}

Please rank the candidates by how well they match the job. Return a JSON array (ONLY the JSON, no markdown fences) with this structure:
[
  {
    "candidateId": "the candidate id",
    "candidateName": "candidate name",
    "matchScore": <number 0-100>,
    "matchingSkills": ["skills that match the job"],
    "missingSkills": ["skills the candidate lacks for this job"],
    "summary": "brief explanation of why this candidate is a good/poor fit"
  }
]

Sort by matchScore descending. Include ALL candidates even if score is 0.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text();

      // Strip markdown fences
      const cleaned = text.replace(/```json?\s*/gi, '').replace(/```/g, '').trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        console.log(`✅ AI candidate matching succeeded with model: ${modelName}`);
        return JSON.parse(jsonMatch[0]);
      }

      return [];
    } catch (err) {
      console.warn(`⚠️ AI model ${modelName} failed for candidate matching: ${err.message}`);
      lastError = err;
    }
  }
  throw new Error('Failed to match candidates: ' + lastError?.message);
}
