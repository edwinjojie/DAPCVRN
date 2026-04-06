import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import {
  Loader2, MapPin, Briefcase, GraduationCap, Award, Code2, Mail, ExternalLink, User
} from 'lucide-react';
import api from '../../../lib/api';

interface CandidateDetailModalProps {
  candidateId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CandidateDetailModal({ candidateId, open, onOpenChange }: CandidateDetailModalProps) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!candidateId || !open) return;
    setLoading(true);
    setError('');
    setData(null);

    api.get(`/candidates/${candidateId}/profile`)
      .then(res => setData(res.data.candidate))
      .catch(err => setError(err?.response?.data?.error || 'Failed to load candidate profile'))
      .finally(() => setLoading(false));
  }, [candidateId, open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Candidate Profile
          </DialogTitle>
        </DialogHeader>

        {loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-slate-500 text-sm">Loading profile…</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">{error}</div>
        )}

        {data && !loading && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shrink-0 shadow-lg">
                {data.name?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-lg font-bold text-slate-800">{data.name}</h3>
                {data.headline && <p className="text-sm text-slate-600 mt-0.5">{data.headline}</p>}
                <div className="flex flex-wrap gap-3 mt-2 text-xs text-slate-500">
                  {data.location && data.location !== 'Unknown' && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />{data.location}
                    </span>
                  )}
                  {data.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />{data.email}
                    </span>
                  )}
                  {data.experience > 0 && (
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" />{data.experience} yrs experience
                    </span>
                  )}
                </div>
              </div>
            </div>

            {data.bio && (
              <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">{data.bio}</p>
            )}

            {/* Skills */}
            {data.skills?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Code2 className="w-4 h-4 text-blue-600" /> Skills
                  <span className="ml-auto text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-bold">
                    {data.skills.length}
                  </span>
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {data.skills.map((s: any, i: number) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200"
                    >
                      {s.name || s}
                      {s.level && <span className="ml-1 text-blue-400 opacity-80">· {s.level}</span>}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Credentials / Certificates */}
            {data.credentials?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-amber-600" /> Credentials &amp; Certificates
                  <span className="ml-auto text-xs bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full font-bold">
                    {data.credentials.length}
                  </span>
                </h4>
                <div className="space-y-2">
                  {data.credentials.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                      <div>
                        <span className="font-medium text-slate-800">{c.title || c.type}</span>
                        {c.issuer && <span className="text-slate-400 ml-2">— {c.issuer}</span>}
                        {c.course && <span className="text-slate-400 ml-1">({c.course})</span>}
                        {c.issueDate && (
                          <span className="text-xs text-slate-400 ml-2">
                            {new Date(c.issueDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <span className={`px-2 py-0.5 text-xs rounded-full font-semibold ml-3 shrink-0 ${
                        c.status === 'verified' ? 'bg-green-100 text-green-700' :
                        c.status === 'issued'   ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications (from profile) */}
            {data.certifications?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-purple-600" /> Certifications
                </h4>
                <div className="space-y-2">
                  {data.certifications.map((c: any, i: number) => (
                    <div key={i} className="flex items-center justify-between bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                      <div>
                        <span className="font-medium text-slate-800">{c.name}</span>
                        {c.issuer && <span className="text-slate-400 ml-2">— {c.issuer}</span>}
                      </div>
                      {c.credentialUrl && (
                        <a href={c.credentialUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:text-blue-800 ml-3">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {data.education?.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-slate-700 flex items-center gap-2 mb-3">
                  <GraduationCap className="w-4 h-4 text-emerald-600" /> Education
                </h4>
                <div className="space-y-2">
                  {data.education.map((e: any, i: number) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg text-sm border border-slate-100">
                      <div className="font-medium text-slate-800">
                        {e.degree}{e.fieldOfStudy ? ` in ${e.fieldOfStudy}` : ''}
                      </div>
                      {e.institution && <div className="text-slate-500">{e.institution}</div>}
                      {(e.startDate || e.endDate) && (
                        <div className="text-xs text-slate-400 mt-0.5">
                          {e.startDate ? new Date(e.startDate).getFullYear() : '?'} –{' '}
                          {e.current ? 'Present' : e.endDate ? new Date(e.endDate).getFullYear() : '?'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!data.skills?.length && !data.credentials?.length && !data.education?.length && !data.certifications?.length && (
              <p className="text-sm text-slate-400 text-center py-6">
                No detailed profile data available for this candidate.
              </p>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
