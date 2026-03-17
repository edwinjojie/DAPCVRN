import React, { useState, useEffect } from 'react';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent } from '../../../../components/ui/card';
import { Sparkles, Target, TrendingUp, BookOpen, CheckCircle, AlertTriangle, Loader2 } from 'lucide-react';
import api from '../../../../lib/api';

interface SkillRecommendation {
  skill: string;
  priority: 'high' | 'medium' | 'low';
  reason: string;
  suggestedResources: string[];
}

interface SkillGapAnalysis {
  targetRole: string;
  matchingSkills: string[];
  missingSkills: string[];
  recommendations: SkillRecommendation[];
  overallReadiness: number;
  summary: string;
}

const POPULAR_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'Full Stack Developer',
  'Data Scientist',
  'Machine Learning Engineer',
  'DevOps Engineer',
  'Cloud Solutions Architect',
  'Cybersecurity Analyst',
  'Mobile App Developer',
  'UI/UX Designer',
  'Blockchain Developer',
  'Product Manager',
];

export default function Recommendations() {
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<SkillGapAnalysis | null>(null);
  const [candidateSkills, setCandidateSkills] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!targetRole.trim()) return;
    setLoading(true);
    setError('');
    setAnalysis(null);

    try {
      const res = await api.post('/ai/skill-gap', { targetRole: targetRole.trim() });
      setCandidateSkills(res.data.candidateSkills || []);
      setAnalysis(res.data.analysis);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to get AI analysis. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const priorityColor = (p: string) => {
    if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
    if (p === 'medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  const readinessColor = (score: number) => {
    if (score >= 75) return 'text-green-600';
    if (score >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">AI Skill Gap Analysis</h1>
          <p className="text-slate-500 mt-1">
            Discover which skills you need to acquire for your dream role.
          </p>
        </div>
        <div className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-bold flex items-center">
          <Sparkles className="w-4 h-4 mr-2" /> AI Powered
        </div>
      </div>

      {/* Input Section */}
      <Card className="border-2 border-purple-200 shadow-lg">
        <CardContent className="p-6 space-y-4">
          <label className="block text-sm font-semibold text-slate-700">
            What role are you targeting?
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Frontend Developer, Data Scientist..."
              className="flex-1 px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-slate-800"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <Button
              onClick={handleAnalyze}
              disabled={loading || !targetRole.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Analyzing...</>
              ) : (
                <><Target className="w-4 h-4 mr-2" /> Analyze</>
              )}
            </Button>
          </div>

          {/* Quick Roles */}
          <div>
            <p className="text-xs text-slate-500 mb-2">Popular roles:</p>
            <div className="flex flex-wrap gap-2">
              {POPULAR_ROLES.map((role) => (
                <button
                  key={role}
                  onClick={() => setTargetRole(role)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    targetRole === role
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            <p className="text-sm text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
          <p className="text-slate-600 font-medium">AI is analyzing your skills...</p>
          <p className="text-xs text-slate-400">This may take a few seconds</p>
        </div>
      )}

      {/* Results */}
      {analysis && !loading && (
        <div className="space-y-6">
          {/* Readiness Score */}
          <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Readiness for: {analysis.targetRole}</h2>
                  <p className="text-purple-100 mt-1 text-sm">{analysis.summary}</p>
                </div>
                <div className="text-center">
                  <div className={`text-5xl font-black ${analysis.overallReadiness >= 60 ? 'text-green-300' : 'text-yellow-300'}`}>
                    {analysis.overallReadiness}%
                  </div>
                  <p className="text-xs text-purple-200 mt-1">Overall Readiness</p>
                </div>
              </div>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100">
              <div
                className="h-2 bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-1000"
                style={{ width: `${analysis.overallReadiness}%` }}
              />
            </div>
          </Card>

          {/* Your Skills & Missing Skills */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Matching Skills */}
            <Card className="border-2 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h3 className="font-bold text-slate-800">Skills You Have</h3>
                  <span className="ml-auto text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold">
                    {analysis.matchingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.matchingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-full text-xs font-medium"
                    >
                      ✓ {skill}
                    </span>
                  ))}
                  {analysis.matchingSkills.length === 0 && (
                    <p className="text-sm text-slate-400">No matching skills detected</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Missing Skills */}
            <Card className="border-2 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Target className="w-5 h-5 text-red-600" />
                  <h3 className="font-bold text-slate-800">Skills to Acquire</h3>
                  <span className="ml-auto text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full font-bold">
                    {analysis.missingSkills.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1.5 bg-red-50 text-red-700 border border-red-200 rounded-full text-xs font-medium"
                    >
                      ✗ {skill}
                    </span>
                  ))}
                  {analysis.missingSkills.length === 0 && (
                    <p className="text-sm text-slate-400">You have all the required skills!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Recommendations */}
          <Card className="border-2 border-slate-200 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <h3 className="text-xl font-bold text-slate-800">Learning Roadmap</h3>
              </div>
              <div className="space-y-4">
                {(analysis.recommendations || []).map((rec, i) => (
                  <div
                    key={i}
                    className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-slate-800 text-lg">{rec.skill}</h4>
                      <span
                        className={`text-xs px-3 py-1 rounded-full border font-bold uppercase ${priorityColor(rec.priority)}`}
                      >
                        {rec.priority} priority
                      </span>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{rec.reason}</p>
                    {rec.suggestedResources && rec.suggestedResources.length > 0 && (
                      <div className="flex items-start gap-2">
                        <BookOpen className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-slate-500">
                          <span className="font-semibold">Resources: </span>
                          {rec.suggestedResources.join(' • ')}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
