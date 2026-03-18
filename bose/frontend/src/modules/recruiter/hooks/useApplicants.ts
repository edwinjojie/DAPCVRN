import { useEffect, useState } from 'react';
import api from '../../../lib/api';
import { useToast } from '../../../components/ui/toast';

export interface Applicant {
  id: string;
  jobId: string;
  jobTitle?: string;
  name: string;
  email: string;
  appliedAt: string;
  status: 'applied' | 'shortlisted' | 'rejected' | 'hired';
  resumeURL?: string;
}

export function useApplicants(jobId?: string) {
  const [data, setData] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      setError(null);
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      
      let endpoint = '';
      if (jobId === 'all' || !jobId) {
        endpoint = `${baseUrl}/api/recruiter/applications`;
      } else {
        endpoint = `${baseUrl}/api/recruiter/jobs/${encodeURIComponent(jobId)}/applicants`;
      }

      const res = await api.get(endpoint);
      
      const mappedApplicants = (res.data.applications || []).map((app: any) => ({
        id: app._id || app.id,
        jobId: app.jobId?._id || app.jobId,
        jobTitle: app.jobId?.title || 'Unknown Job',
        name: app.candidateName || app.candidateId?.name || 'Unknown',
        email: app.candidateEmail || app.candidateId?.email || 'Unknown',
        appliedAt: app.appliedAt || app.createdAt,
        status: app.status,
        resumeURL: app.resume || undefined
      }));
      
      setData(mappedApplicants);
    } catch (err: any) {
      console.error('Failed to fetch applicants:', err);
      setError(err.response?.data?.error || 'Failed to load applicants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [jobId]);

  const updateStatus = async (id: string, status: Applicant['status']) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await api.put(`${baseUrl}/api/recruiter/applications/${encodeURIComponent(id)}/status`, { status });
      setData((prev) => prev.map((a) => (a.id === id ? { ...a, status: res.data.application.status } : a)));
      toast({ title: 'Status updated', description: `Applicant ${status}`, variant: 'success' });
    } catch (e: any) {
      toast({ title: 'Update failed', description: e?.response?.data?.error || 'Please try again', variant: 'error' });
    }
  };

  return { data, loading, error, updateStatus };
}


