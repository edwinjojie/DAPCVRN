import React, { useState } from 'react';
import CandidateSearchBar from '../components/CandidateSearchBar';
import CandidateCard from '../components/CandidateCard';
import CandidateDetailModal from '../components/CandidateDetailModal';
import { useCandidateSearch } from '../hooks/useCandidateSearch';

export default function Candidates() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { data, loading, error } = useCandidateSearch(filters);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Candidate Search</h1>
      <CandidateSearchBar onSearch={setFilters} />
      {loading && <p className="text-slate-600">Loading candidates...</p>}
      {error && <p className="text-red-600 font-semibold">{error}</p>}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((c) => (
          <CandidateCard
            key={c.id}
            candidate={c}
            onView={(id) => setSelectedCandidateId(id)}
          />
        ))}
      </div>

      {data.length === 0 && !loading && !error && (
        <div className="text-center py-12 bg-slate-50 rounded-lg border-2 border-slate-200">
          <p className="text-slate-600">No candidates found. Try adjusting your search filters.</p>
        </div>
      )}

      {/* Candidate Detail Modal */}
      <CandidateDetailModal
        candidateId={selectedCandidateId}
        open={!!selectedCandidateId}
        onOpenChange={(open) => { if (!open) setSelectedCandidateId(null); }}
      />
    </div>
  );
}
