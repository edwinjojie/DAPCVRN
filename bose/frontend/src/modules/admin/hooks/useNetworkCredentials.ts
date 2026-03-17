import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface NetworkCredential {
  _id: string;
  credentialId?: string;
  title: string;
  studentName: string;
  studentEmail?: string;
  institution: string;
  type: string;
  status: 'pending' | 'verified' | 'revoked';
  issueDate: string;
  blockchainTxId?: string;
  isPotentialDuplicate?: boolean;
}

export interface CredentialFilters {
  type?: string;
  status?: string;
  search?: string;
}

export function useNetworkCredentials(initialFilters: CredentialFilters = {}) {
  const [credentials, setCredentials] = useState<NetworkCredential[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<CredentialFilters>(initialFilters);
  const { toast } = useToast();

  const fetchCredentials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.type) params.append('type', filters.type);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/admin/credentials?${params.toString()}`);
      setCredentials(res.data.data);
    } catch (error) {
      console.error("Error fetching network credentials:", error);
      toast({ title: "Failed to fetch credentials", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchCredentials();
  }, [fetchCredentials]);

  const revokeCredential = async (id: string, reason: string) => {
    try {
      await api.post(`/admin/credentials/${id}/revoke`, { reason });
      await fetchCredentials();
      toast({ title: "Credential revoked successfully", variant: "success" });
    } catch (error: any) {
      toast({ 
        title: error.response?.data?.error || "Failed to revoke credential", 
        variant: "error" 
      });
    }
  };

  return { 
    credentials, 
    loading, 
    filters, 
    setFilters, 
    revokeCredential, 
    refresh: fetchCredentials 
  };
}
