import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export interface Candidate {
  id: string;
  name: string;
  skills: string[];
  experience: number;
  location: string;
  verified: boolean;
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
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await api.get(`${baseUrl}/api/recruiter/candidates`, { params: filters });
        
        // Map User model to Candidate interface
        const mappedCandidates = (res.data.candidates || res.data || []).map((user: any) => ({
          id: user._id || user.id,
          name: user.name,
          skills: user.skills || [],
          experience: user.experience || 0, // Placeholder
          location: user.location || 'Unknown',
          verified: user.verifiedCredentials || false,
          rating: user.rating || 0 // Placeholder
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


