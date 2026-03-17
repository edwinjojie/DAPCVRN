import { useEffect, useState } from "react";
import api from "../../../lib/api";

export function useAdminSummary() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res = await api.get("/api/admin/summary");
        setData(res.data.data);
      } catch (error) {
        console.error("Error fetching admin summary:", error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return { data, loading };
}


