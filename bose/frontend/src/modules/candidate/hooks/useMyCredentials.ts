import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export function useMyCredentials() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get("/credentials/my");
      setData(Array.isArray(res.data) ? res.data : []);
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to load credentials';
      setError(message);
      setData([]);
      console.error('useMyCredentials error:', err);
      if (err?.response?.status !== 401) {
        toast({ title: "Failed to load credentials", description: message, variant: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  const deleteCredential = async (id: string) => {
    try {
      await api.delete(`/credentials/${id}`);
      toast({ title: "Credential deleted", variant: "success" });
      await reload();
    } catch (err: any) {
      const message = err?.response?.data?.error || 'Failed to delete credential';
      toast({ title: "Delete Failed", description: message, variant: "error" });
      throw err;
    }
  };

  const getBlockchainStatus = async (credentialId: string) => {
    try {
      const res = await api.get(`/credentials/blockchain-status/${credentialId}`);
      return res.data;
    } catch (err: any) {
      console.error('getBlockchainStatus error:', err);
      return { isAnchored: false, error: err?.response?.data?.error || 'Failed to check status' };
    }
  };

  useEffect(() => { reload(); }, []);
  return { data, loading, error, reload, deleteCredential, getBlockchainStatus };
}
