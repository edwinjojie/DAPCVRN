import { useEffect, useState } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export function useJobs() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const reload = async () => {
    setLoading(true);
    try {
      const res = await api.get("/public/jobs");
      setJobs(res.data || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const apply = async (jobId: string, title: string) => {
    try {
      await api.post(`/jobs/${jobId}/apply`, { coverLetter: `Applying for ${title}` });
      toast({ title: "Applied successfully!", variant: "success" });
    } catch (e: any) {
      toast({ title: "Application Failed", description: e?.response?.data?.error || "Unknown error", variant: "error" });
    }
  };

  useEffect(() => { reload(); }, []);
  return { jobs, loading, apply, reload };
}


