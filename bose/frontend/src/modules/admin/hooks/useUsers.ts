import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'university' | 'recruiter' | 'admin';
  status: 'active' | 'banned' | 'pending';
  isActive: boolean;
  lastLogin?: string;
  organization?: string;
  organizationId?: { _id: string; name: string };
  createdAt: string;
}

export interface UserFilters {
  role?: string;
  status?: string;
  search?: string;
}

export function useUsers(initialFilters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<UserFilters>(initialFilters);
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role) params.append('role', filters.role);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const res = await api.get(`/api/admin/users?${params.toString()}`);
      setUsers(res.data.data);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({ title: "Failed to fetch users", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [filters, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const banUser = async (id: string) => {
    try {
      await api.post(`/api/admin/users/${id}/ban`);
      await fetchUsers();
      toast({ title: "User banned successfully", variant: "success" });
    } catch (error: any) {
      toast({ title: error.response?.data?.error || "Failed to ban user", variant: "error" });
    }
  };

  const unbanUser = async (id: string) => {
    try {
      await api.post(`/api/admin/users/${id}/unban`);
      await fetchUsers();
      toast({ title: "User unbanned successfully", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to unban user", variant: "error" });
    }
  };

  const updateUserRole = async (id: string, role: string) => {
    try {
      await api.post(`/api/admin/users/${id}/role`, { role });
      await fetchUsers();
      toast({ title: "User role updated", variant: "success" });
    } catch (error) {
      toast({ title: "Failed to update role", variant: "error" });
    }
  };

  return { 
    users, 
    loading, 
    filters, 
    setFilters, 
    banUser, 
    unbanUser, 
    updateUserRole, 
    refresh: fetchUsers 
  };
}
