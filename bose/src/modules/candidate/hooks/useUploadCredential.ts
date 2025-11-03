import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export function useUploadCredential(reload: () => void) {
  const { toast } = useToast();

  const upload = async (payload: any) => {
    await api.post("/api/credentials/upload", payload);
    toast({ title: "Credential uploaded!", variant: "success" });
    reload();
  };
  return { upload };
}


