import { useToast } from "../../../components/ui/toast";
import * as universityService from '../services/universityService';

export function useIssueCredential(onSuccess?: () => void) {
  const { toast } = useToast();

  const issue = async (payload: any) => {
    try {
      await universityService.issueCredential(payload);
      toast({ title: "Credential issued", variant: "success" });
      onSuccess && onSuccess();
    } catch (err: any) {
      toast({ 
        title: "Failed to issue credential", 
        description: err?.response?.data?.error || err.message,
        variant: "error" 
      });
    }
  };
  return { issue };
}


