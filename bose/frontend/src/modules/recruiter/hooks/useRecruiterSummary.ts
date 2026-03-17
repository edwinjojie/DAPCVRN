import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export interface RecruiterSummary {
  totalJobs: number;
  openJobs: number;
  totalCandidates: number;
  verifiedCandidates: number;
}

export interface ActivityItem {
  id: string;
  message: string;
  time: string;
}

export function useRecruiterSummary() {
  const [summary, setSummary] = useState<RecruiterSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';

    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get(`${baseUrl}/api/recruiter/dashboard`);
        if (!isMounted) return;
        setSummary(res.data.stats);
        
        // Map recent activity from applications
        const mappedActivity = res.data.recentActivity.map((app: any) => ({
          id: app._id,
          message: `${app.candidateName} applied to ${app.jobId?.title || 'a Job'}`,
          time: new Date(app.appliedAt || app.createdAt).toISOString()
        }));
        setActivity(mappedActivity);
      } catch (err: any) {
        if (!isMounted) return;
        setError(err?.response?.data?.error || 'Failed to load dashboard');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  return { summary, activity, loading, error };
}


