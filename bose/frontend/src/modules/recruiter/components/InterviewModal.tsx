import React, { useState } from 'react';
import { X, Calendar, MapPin, Video, Clock, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import api from '../../../lib/api';

interface InterviewModalProps {
  candidateId: string;
  candidateName: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function InterviewModal({ 
  candidateId, 
  candidateName, 
  applicationId, 
  jobId, 
  jobTitle, 
  onClose, 
  onSuccess 
}: InterviewModalProps) {
  const [title, setTitle] = useState(`Interview with ${candidateName} for ${jobTitle}`);
  const [description, setDescription] = useState('We are excited to learn more about your experience and skills.');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [location, setLocation] = useState('Video Call');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/xyz-abc-123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSchedule = async () => {
    if (!startTime || !endTime) return;

    setLoading(true);
    setError(null);
    try {
      await api.post('/recruiter/interviews/schedule', {
        candidateId,
        jobId,
        applicationId,
        title,
        description,
        startTime,
        endTime,
        location,
        meetingLink
      });
      onSuccess();
    } catch (err: any) {
      console.error('Failed to schedule interview:', err);
      setError(err.response?.data?.error || 'Failed to schedule interview');
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
              <Calendar className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Schedule Interview</h2>
              <p className="text-sm text-gray-500">Candidate: {candidateName}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-gray-100">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <CardContent className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg border border-red-100">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Interview Title</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Technical Interview - Stage 1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Start Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">End Date & Time</label>
              <input 
                type="datetime-local" 
                className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Location / Meeting Type</label>
            <select 
              className="w-full p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none bg-white"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            >
              <option value="Video Call">Video Call</option>
              <option value="Phone Call">Phone Call</option>
              <option value="On-site Office">On-site Office</option>
            </select>
          </div>

          {location === 'Video Call' && (
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Meeting Link</label>
              <div className="relative">
                <Video className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <input 
                  type="url" 
                  className="w-full pl-10 p-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  placeholder="https://meet.google.com/..."
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Description / Agenda</label>
            <textarea 
              className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What will you cover in this interview?"
            />
          </div>
        </CardContent>

        <div className="p-6 border-t border-gray-100 bg-white flex justify-end gap-3 rounded-b-2xl">
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-lg shadow-blue-500/20"
            onClick={handleSchedule}
            disabled={loading || !startTime || !endTime}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
            Schedule Interview
          </Button>
        </div>
      </Card>
    </div>
  );
}