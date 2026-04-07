import { useEffect, useState } from 'react';
import api from '../../../lib/api';

export function useMessages(candidateId?: string) {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('bose_user');
    if (raw) {
      try {
        const user = JSON.parse(raw);
        if (user.id) setCurrentUserId(user.id);
      } catch (err) {
        console.error('Failed to parse user from session:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (!candidateId) return;
    (async () => {
      setLoading(true);
      try {
        const res = await api.get(`/messages/${encodeURIComponent(candidateId)}`);
        // Ensure messages are sorted by date
        const sorted = (res.data || []).sort((a: any, b: any) => 
          new Date(a.sentAt || a.createdAt).getTime() - new Date(b.sentAt || b.createdAt).getTime()
        );
        setMessages(sorted);
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

  return { messages, loading, sendMessage, currentUserId };
}
