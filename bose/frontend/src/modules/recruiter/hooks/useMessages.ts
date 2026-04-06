import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export function useMessages(candidateId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!candidateId) return;
    (async () => {
      setLoading(true);
      try {
        // api already has baseURL set — don't prepend it again
        const res = await api.get(`/messages/${encodeURIComponent(candidateId)}`);
        setMessages(res.data || []);
      } catch (err) {
        console.error('Failed to fetch messages:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    })();
  }, [candidateId]);

  const sendMessage = async (text: string) => {
    if (!candidateId) return;
    try {
      const res = await api.post(`/messages/${encodeURIComponent(candidateId)}`, { text });
      setMessages((prev) => [...prev, res.data]);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  return { messages, loading, sendMessage };
}
