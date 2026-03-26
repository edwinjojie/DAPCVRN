import { useEffect, useState } from "react";
import * as universityService from '../services/universityService';

export function useIssuedCredentials() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await universityService.fetchIssuedCredentials();
      setData(res.data.data || res.data || []);
    } catch (err) {
      console.error("Failed to fetch issued credentials", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return { data, loading, refresh: fetchData };
}


