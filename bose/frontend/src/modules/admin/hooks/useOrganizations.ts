import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface Org { 
  _id: string; 
  organizationId: string; 
  name: string; 
  type: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  approved: boolean; 
  email: string;
  memberCount: number;
  credentialsCount: number;
  rejectionRate?: number;
}

export function useOrganizations() {
  const [orgs, setOrgs] = useState<Org[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchOrgs = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/orgs");
      setOrgs(res.data.data);
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast({ title: "Failed to fetch organizations", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgs();
  }, []);

  const approveOrg = async (id: string) => {
    try {
      await api.post(`/admin/orgs/${id}/approve`);
      await fetchOrgs();
      toast({ title: "Organization approved", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to approve organization", variant: "error" });
    }
  };

  const rejectOrg = async (id: string, reason: string) => {
    try {
      await api.post(`/admin/orgs/${id}/reject`, { reason });
      await fetchOrgs();
      toast({ title: "Organization rejected", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to reject organization", variant: "error" });
    }
  };

  const suspendOrg = async (id: string) => {
    try {
      await api.post(`/admin/orgs/${id}/suspend`);
      await fetchOrgs();
      toast({ title: "Organization suspended", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to suspend organization", variant: "error" });
    }
  };

  const reactivateOrg = async (id: string) => {
    try {
      await api.post(`/admin/orgs/${id}/reactivate`);
      await fetchOrgs();
      toast({ title: "Organization reactivated", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to reactivate organization", variant: "error" });
    }
  };

  return { orgs, loading, approveOrg, rejectOrg, suspendOrg, reactivateOrg, refresh: fetchOrgs };
}


