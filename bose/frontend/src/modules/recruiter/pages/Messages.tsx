import { useState, useEffect } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';
import api from '../../../lib/api';
import { Loader2, MessageSquare, Users } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
}

export default function Messages() {
  const [candidateId, setCandidateId] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(true);
  const { messages, loading: messagesLoading, sendMessage } = useMessages(candidateId || undefined);

  // Fetch real candidate list from DB
  useEffect(() => {
    (async () => {
      setLoadingCandidates(true);
      try {
        const res = await api.get('/recruiter/candidates');
        const list: Candidate[] = (res.data?.candidates || res.data || []).map((c: any) => ({
          id: c._id || c.id,
          name: c.name || `${c.firstName || ''} ${c.lastName || ''}`.trim() || 'Unknown',
          email: c.email || '',
        }));
        setCandidates(list);
        // Auto-select first candidate
        if (list.length > 0 && !candidateId) {
          setCandidateId(list[0].id);
        }
      } catch (err) {
        console.error('Failed to load candidates:', err);
      } finally {
        setLoadingCandidates(false);
      }
    })();
  }, []);

  const selectedCandidate = candidates.find(c => c.id === candidateId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          Messages
        </h1>
        {selectedCandidate && (
          <div className="text-sm text-slate-500">
            Chatting with <span className="font-semibold text-slate-700">{selectedCandidate.name}</span>
            {selectedCandidate.email && <span className="ml-1 text-slate-400">({selectedCandidate.email})</span>}
          </div>
        )}
      </div>

      {/* Candidate Selector */}
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-slate-600 flex items-center gap-1 whitespace-nowrap">
          <Users className="w-4 h-4" />
          Select Candidate:
        </label>
        {loadingCandidates ? (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin" />
            Loading candidates...
          </div>
        ) : candidates.length === 0 ? (
          <p className="text-sm text-slate-400 italic">No candidates found in the system.</p>
        ) : (
          <select
            className="rounded-lg border-2 border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-w-[220px]"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
          >
            <option value="">— Select a candidate —</option>
            {candidates.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}{c.email ? ` (${c.email})` : ''}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Message Thread */}
      {!candidateId ? (
        <div className="flex flex-col items-center justify-center py-16 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
          <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
          <p className="text-slate-500 font-medium">Select a candidate to start messaging</p>
          <p className="text-sm text-slate-400 mt-1">Choose from the dropdown above</p>
        </div>
      ) : (
        <>
          {messagesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-sm text-slate-500">Loading messages...</span>
            </div>
          ) : (
            <MessageThread messages={messages} />
          )}
          <MessageInput onSend={sendMessage} />
        </>
      )}
    </div>
  );
}
