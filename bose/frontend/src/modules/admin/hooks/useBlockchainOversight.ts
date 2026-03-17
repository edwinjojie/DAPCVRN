import { useEffect, useState, useCallback } from "react";
import api from "../../../lib/api";
import { useToast } from "../../../components/ui/toast";

export interface BlockchainHealth {
  status: 'UP' | 'DOWN';
  latency: string;
  peers: Array<{ name: string; status: string; role: string }>;
  metrics: {
    totalTransactions: number;
    successRate: string;
  };
}

export interface BlockchainTransaction {
  _id: string;
  title: string;
  studentName: string;
  institution: string;
  issueDate: string;
  blockchainTxId: string;
  status: string;
  updatedAt: string;
}

export function useBlockchainOversight() {
  const [health, setHealth] = useState<BlockchainHealth | null>(null);
  const [transactions, setTransactions] = useState<BlockchainTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchHealth = useCallback(async () => {
    try {
      const res = await api.get("/admin/blockchain/health");
      setHealth(res.data.data);
    } catch (error) {
      console.error("Error fetching blockchain health:", error);
    }
  }, []);

  const fetchTransactions = useCallback(async () => {
    try {
      const res = await api.get("/admin/blockchain/transactions");
      setTransactions(res.data.data);
    } catch (error) {
      console.error("Error fetching blockchain transactions:", error);
    }
  }, []);

  const refreshAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchHealth(), fetchTransactions()]);
    setLoading(false);
  }, [fetchHealth, fetchTransactions]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const verifyManual = async (credentialId: string) => {
    try {
      const res = await api.post("/admin/blockchain/verify-manual", { credentialId });
      toast({ title: "Verification Successful", description: "Credential data matches the blockchain record.", variant: "success" });
      return res.data.data;
    } catch (error: any) {
      toast({ title: "Verification Failed", description: error.response?.data?.error || "Blockchain data mismatch.", variant: "error" });
      return null;
    }
  };

  return { health, transactions, loading, verifyManual, refresh: refreshAll };
}
