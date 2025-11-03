import { useEffect, useState } from "react";
import api from "../../../lib/api";

export function useIssuedCredentials() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await api.get("/api/institutions/issued");
      setData(res.data);
      setLoading(false);
    })();
  }, []);

  return { data, loading };
}


