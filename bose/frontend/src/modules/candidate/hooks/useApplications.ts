import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export function useApplications() {
  const [apps, setApps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/applications/my");
      setApps(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load applications';
      setError(message);
      setApps([]); // Return empty array on error so UI doesn't crash
      console.error('useApplications error:', err);
      if (err?.response?.status !== 401) {
        toast({ title: 'Applications Error', description: message, variant: 'error' });
      }
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (applicationId: string) => {
    try {
      await api.delete(`/applications/${applicationId}`);
      toast({ title: 'Application Withdrawn', variant: 'success' });
      await reload();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to withdraw application';
      toast({ title: 'Withdrawal Failed', description: message, variant: 'error' });
      throw err;
    }
  };

  useEffect(() => { reload(); }, []);
  return { apps, loading, error, reload, withdraw };
}
