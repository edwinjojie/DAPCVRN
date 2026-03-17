import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

/**
 * Analyze the skill gap for a candidate targeting a specific role / job.
 *
 * @param {string[]} candidateSkills - Skills the candidate already has
 * @param {string}   targetRole      - The job title / role the candidate is targeting
 * @param {string[]} jobSkills       - Skills required by the target job (if available)
 * @returns {Promise<object>}        - AI-generated skill gap analysis
 */
export async function analyzeSkillGap(candidateSkills, targetRole, jobSkills = []) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `You are an expert career advisor and skills analyst.

A candidate has the following skills: ${candidateSkills.join(', ')}.

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
      "priority": "high" | "medium" | "low",
      "reason": "why this skill is important for the target role",
      "suggestedResources": ["free course or resource name"]
    }
  ],
  "overallReadiness": <number 0-100>,
  "summary": "A short summary of the candidate's readiness for the role"
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON from the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return {
      error: false,
      targetRole,
      matchingSkills: [],
      missingSkills: [],
      recommendations: [],
      overallReadiness: 0,
      summary: text
    };
  } catch (error) {
    console.error('AI Skill Gap Analysis error:', error);
    throw new Error('Failed to generate skill gap analysis: ' + error.message);
  }
}

/**
 * Match and rank candidates for a specific job based on skills.
 *
 * @param {object}   job        - The job document (title, skills, description, etc.)
 * @param {object[]} candidates - Array of candidate profiles with skills
 * @returns {Promise<object>}   - AI-generated ranked candidate list
 */
export async function matchCandidatesToJob(job, candidates) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    // Build a concise snapshot of each candidate
    const candidateSummaries = candidates.map((c, i) => ({
      index: i,
      id: c._id?.toString() || c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
      skills: (c.skills || []).map(s => (typeof s === 'string' ? s : s.name)),
      experience: c.yearsOfExperience || 0,
      headline: c.headline || ''
    }));

    const prompt = `You are an expert recruiter AI assistant.

Here is a job posting:
- Title: ${job.title}
- Required Skills: ${(job.skills || []).join(', ')}
- Description: ${job.description || 'N/A'}
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

Sort by matchScore descending. Include ALL candidates.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON from the AI response
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    return [];
  } catch (error) {
    console.error('AI Candidate Matching error:', error);
    throw new Error('Failed to match candidates: ' + error.message);
  }
}
