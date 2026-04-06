import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

interface CandidateSummary {
  verifiedCredentials: number;
  pendingCredentials: number;
  activeApplications: number;
  unreadMessages: number;
}

export function useCandidateSummary() {
  const [data, setData] = useState<CandidateSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/candidate/summary");
      setData(res.data);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load summary';
      setError(message);
      console.error('useCandidateSummary error:', err);
      // Don't toast on 401 — likely not logged in
      if (err?.response?.status !== 401) {
        toast({ title: 'Dashboard Error', description: message, variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    reload();
  }, []);

  return { data, loading, error, reload };
}
