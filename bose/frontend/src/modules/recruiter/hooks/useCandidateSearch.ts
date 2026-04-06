import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  experience: number;
  location: string;
  headline: string;
  rating: number;
}

export function useCandidateSearch(filters: Record<string, any>) {
  const [data, setData] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Use the recruiter candidates endpoint which queries real DB
        const res = await api.get(`/recruiter/candidates`, { params: filters });

        // Map User model to Candidate interface
        const mappedCandidates = (res.data.candidates || res.data || []).map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          email: user.email || '',
          skills: user.skills || [],
          experience: user.experience || user.yearsOfExperience || 0,
          location: user.location || 'Unknown',
          headline: user.headline || '',
          rating: user.rating || 0
        }));

        setData(mappedCandidates);
      } catch (err: any) {
        setError(err?.response?.data?.error || err?.message || 'Failed to search candidates');
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(filters)]);

  return { data, loading, error };
}
