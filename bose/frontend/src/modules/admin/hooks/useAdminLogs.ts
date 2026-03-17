import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface AuditLog {
  _id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string;
  reason?: string;
  details?: any;
  timestamp: string;
}

export function useAdminLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("/api/admin/logs");
      setLogs(res.data.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
      toast({ title: "Failed to fetch activity logs", variant: "error" });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return { logs, loading, refresh: fetchLogs };
}
