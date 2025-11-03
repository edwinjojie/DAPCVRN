import React, { useState } from 'react';
import CandidateSearchBar from '../components/CandidateSearchBar';
import CandidateCard from '../components/CandidateCard';
import CandidateTable from '../components/CandidateTable';
import { useCandidateSearch } from '../hooks/useCandidateSearch';
import { useCredentialLookup } from '../hooks/useCredentialLookup';

export default function Candidates() {
  const [filters, setFilters] = useState<Record<string, any>>({});
  const { data, loading, error } = useCandidateSearch(filters);
  const { data: creds, fetchCredentials, loading: credLoading } = useCredentialLookup();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Candidate Search</h1>
      <CandidateSearchBar onSearch={setFilters} />
      {loading && <p>Loading candidates...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.map((c) => (
          <CandidateCard key={c.id} candidate={c} onView={fetchCredentials} />
        ))}
      </div>

      {/* Optional table view example (not wired to toggle) */}
      {/* <CandidateTable data={data} onView={fetchCredentials} /> */}

      {credLoading && <p>Loading credentials...</p>}
      {creds && (
        <div className="bg-white p-4 rounded-xl border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Credentials for {creds.candidateId}</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            {creds.credentials.map((cr: any) => (
              <li key={cr.credentialId} className="flex justify-between border-b border-gray-200 pb-2">
                <span>
                  {cr.type} – {cr.issuer}
                </span>
                <span className={cr.status === 'verified' ? 'text-green-600' : 'text-amber-600'}>
                  {cr.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}


