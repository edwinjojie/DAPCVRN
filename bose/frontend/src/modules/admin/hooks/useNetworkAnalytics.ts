import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface DetailedAnalytics {
  growth: {
    users: Array<{ _id: { year: number; month: number }; count: number }>;
    credentials: Array<{ _id: { year: number; month: number }; count: number }>;
  };
  distribution: Array<{ _id: string; count: number }>;
  fraud: {
    rejectionRate: number;
    revocationCount: number;
    suspiciousOrgsCount: number;
    suspiciousOrgsDetails: Array<{ _id: string; total: number; rejected: number; rejectionRate: number }>;
  };
}

export function useNetworkAnalytics() {
  const [data, setData] = useState<DetailedAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await api.get("/admin/analytics/detailed");
      setData(res.data.data);
    } catch (error) {
      console.error("Error fetching detailed analytics:", error);
      toast({ title: "Failed to fetch analytics", variant: "error" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return { data, loading, refresh: fetchAnalytics };
}
