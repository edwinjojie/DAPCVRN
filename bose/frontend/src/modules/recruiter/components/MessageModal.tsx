import React, { useState } from 'react';
import { X, Send, MessageSquare, Loader2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import api from '../../../lib/api';

interface MessageModalProps {
  recipientId: string;
  recipientName: string;
  applicationId: string;
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function MessageModal({ 
  recipientId, 
  recipientName, 
  applicationId, 
  jobId, 
  onClose, 
  onSuccess 
}: MessageModalProps) {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState(`Inquiry regarding your application for ${jobId}`);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSend = async () => {
    if (!content.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await api.post('/recruiter/messages/send', {
        recipientId,
        content,
        subject,
        relatedJob: jobId,
        relatedApplication: applicationId
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setError(err.response?.data?.error || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <Card className="w-full max-w-lg shadow-2xl border-none">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-xl">
              <MessageSquare className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Direct Inquiry</h2>
              <p className="text-sm text-gray-500">To: {recipientName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Subject</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Message subject"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Message Content</label>
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[150px]"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Type your message to the candidate..."
            />
          </div>
        </CardContent>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20"
            onClick={handleSend}
            disabled={loading || !content.trim()}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            Send Message
          </Button>
        </div>
      </Card>
    </div>
  );
}