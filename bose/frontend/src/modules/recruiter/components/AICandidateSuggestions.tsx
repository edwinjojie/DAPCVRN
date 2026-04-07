import { useState, useEffect } from 'react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Sparkles, Users, CheckCircle, XCircle, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../../lib/api';

interface RankedCandidate {
  candidateId: string;
  candidateName: string;
  matchScore: number;
  matchingSkills: string[];
  missingSkills: string[];
  summary: string;
}

interface AICandidateSuggestionsProps {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function AICandidateSuggestions({ jobId, jobTitle, open, onOpenChange }: AICandidateSuggestionsProps) {
  const [candidates, setCandidates] = useState<RankedCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fetched, setFetched] = useState(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fetchRecommendations = async () => {
    setLoading(true);
    setError('');
    setCandidates([]);
    try {
      const res = await api.get(`/ai/recommend-candidates/${jobId}`);
      setCandidates(res.data.candidates || []);
      setFetched(true);
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Failed to get AI recommendations.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const handleOpen = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  // Fetch when the modal opens externally, effectively replacing the broken onOpenChange trigger
  useEffect(() => {
    if (open && !fetched) {
      fetchRecommendations();
    }
  }, [open, fetched, jobId]);

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Candidate Suggestions
          </DialogTitle>
          <p className="text-sm text-slate-500">
            Top candidates for: <span className="font-semibold text-slate-700">{jobTitle}</span>
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Loading */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-purple-600" />
              <p className="text-slate-600 font-medium">AI is analyzing candidates...</p>
              <p className="text-xs text-slate-400">This may take a few seconds</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
              {error}
              <Button onClick={fetchRecommendations} variant="outline" className="mt-3 w-full">
                Retry
              </Button>
            </div>
          )}

          {/* Results */}
          {!loading && !error && candidates.length > 0 && (
            <>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Users className="w-4 h-4" />
                {candidates.length} candidate{candidates.length !== 1 ? 's' : ''} found
              </div>

              {candidates.map((c, idx) => (
                <Card
                  key={c.candidateId || idx}
                  className="border-2 border-slate-200 hover:border-purple-300 transition-all cursor-pointer"
                  onClick={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {/* Rank badge */}
                        <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-sm">
                          #{idx + 1}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800">{c.candidateName}</h4>
                          <p className="text-xs text-slate-500 line-clamp-1">{c.summary}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-lg font-black px-3 py-1 rounded-lg border ${scoreColor(c.matchScore)}`}>
                          {c.matchScore}%
                        </span>
                        {expandedIdx === idx ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedIdx === idx && (
                      <div className="mt-4 pt-4 border-t border-slate-100 space-y-3">
                        <p className="text-sm text-slate-600">{c.summary}</p>

                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-xs font-semibold text-green-700 flex items-center gap-1 mb-1">
                              <CheckCircle className="w-3 h-3" /> Matching Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {c.matchingSkills.map((s) => (
                                <span key={s} className="text-xs px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-full">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-red-700 flex items-center gap-1 mb-1">
                              <XCircle className="w-3 h-3" /> Missing Skills
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {c.missingSkills.map((s) => (
                                <span key={s} className="text-xs px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded-full">
                                  {s}
                                </span>
                              ))}
                              {c.missingSkills.length === 0 && (
                                <span className="text-xs text-slate-400">None</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {/* No results */}
          {!loading && !error && fetched && candidates.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 font-medium">No candidates found</p>
              <p className="text-xs text-slate-400">There are no candidate profiles in the system yet.</p>
            </div>
          )}

          {/* Refresh */}
          {fetched && !loading && (
            <Button
              onClick={fetchRecommendations}
              variant="outline"
              className="w-full"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Re-analyze Candidates
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
