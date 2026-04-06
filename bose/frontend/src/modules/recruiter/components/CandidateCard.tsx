import React from 'react';
import type { Candidate } from '../hooks/useCandidateSearch';
import { MapPin, Briefcase } from 'lucide-react';

interface Props {
  candidate: Candidate;
  onView: (id: string) => void;
}

export default function CandidateCard({ candidate, onView }: Props) {
  return (
    <div
      className="bg-white p-5 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer"
      onClick={() => onView(candidate.id)}
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {candidate.name?.charAt(0)?.toUpperCase() || '?'}
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-slate-800 truncate">{candidate.name}</h3>
          {candidate.headline && (
            <p className="text-xs text-slate-500 truncate">{candidate.headline}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-500 mb-3">
        {candidate.location && candidate.location !== 'Unknown' && (
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{candidate.location}</span>
        )}
        {candidate.experience > 0 && (
          <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" />{candidate.experience} yrs</span>
        )}
      </div>

      {candidate.skills.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {candidate.skills.slice(0, 5).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 text-xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-100">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 5 && (
            <span className="px-2 py-0.5 text-xs text-slate-400">+{candidate.skills.length - 5} more</span>
          )}
        </div>
      )}

      <p className="text-xs text-blue-600 font-medium mt-3">Click to view full profile →</p>
    </div>
  );
}
