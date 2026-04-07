import { useState, useEffect, useMemo } from 'react';
import { useMessages } from '../hooks/useMessages';
import MessageThread from '../components/MessageThread';
import MessageInput from '../components/MessageInput';
import api from '../../../lib/api';
import { Loader2, MessageSquare, Search } from 'lucide-react';

interface Candidate {
  id: string;
  name: string;
  email: string;
}

export default function Messages() {
  const [candidateId, setCandidateId] = useState('');
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
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
        // Auto-select first candidate if none selected
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
  
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return candidates;
    const lowerQ = searchQuery.toLowerCase();
    return candidates.filter(c => 
      c.name.toLowerCase().includes(lowerQ) || 
      c.email.toLowerCase().includes(lowerQ)
    );
  }, [candidates, searchQuery]);

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[600px] border border-slate-200 rounded-xl overflow-hidden bg-white shadow-lg animate-fade-in">
      {/* Sidebar - Candidates List */}
      <div className="w-1/3 min-w-[280px] max-w-[350px] bg-slate-50 border-r border-slate-200 flex flex-col">
        <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            Messages
          </h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search candidates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingCandidates ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500 gap-2">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="text-sm">Loading candidates...</span>
            </div>
          ) : filteredCandidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <p className="text-sm text-slate-500 italic">No candidates found matching your search.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredCandidates.map(c => (
                <div 
                  key={c.id} 
                  onClick={() => setCandidateId(c.id)}
                  className={`p-4 cursor-pointer transition-colors relative group ${c.id === candidateId ? 'bg-blue-50' : 'bg-white hover:bg-slate-50'}`}
                >
                  {/* Active indicator bar */}
                  {c.id === candidateId && (
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600" />
                  )}
                  
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 text-blue-700 font-bold flex items-center justify-center shrink-0 shadow-sm border border-blue-200">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="overflow-hidden flex-1">
                      <h3 className={`font-semibold truncate ${c.id === candidateId ? 'text-blue-900' : 'text-slate-800'}`}>
                        {c.name}
                      </h3>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{c.email}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/50">
        {!candidateId ? (
          <div className="flex-1 flex flex-col items-center justify-center bg-slate-50 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "url('https://www.transparenttextures.com/patterns/connectwork.png')" }}></div>
            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-lg border border-slate-100 mb-6 relative z-10">
              <MessageSquare className="w-10 h-10 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-700 mb-2 relative z-10">Your Messages</h3>
            <p className="text-slate-500 max-w-sm text-center font-medium relative z-10">Select a candidate from the sidebar to view their application history or send a message.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-100 to-blue-100 border-2 border-white shadow-md text-blue-700 font-bold flex items-center justify-center shrink-0 text-lg">
                  {selectedCandidate?.name.charAt(0).toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-lg leading-tight">{selectedCandidate?.name}</h3>
                  <p className="text-sm text-slate-500 font-medium">{selectedCandidate?.email}</p>
                </div>
              </div>
              <div className="text-xs font-semibold px-3 py-1.5 bg-green-100 text-green-700 rounded-full border border-green-200 shadow-sm">
                Active Candidate
              </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <span className="text-sm font-medium text-slate-500">Loading conversation...</span>
                  </div>
                </div>
              ) : (
                <MessageThread messages={messages} />
              )}
            </div>
            
            {/* Chat Input */}
            <div className="bg-white border-t border-slate-200 p-4 shrink-0 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.02)]">
              <MessageInput onSend={sendMessage} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
