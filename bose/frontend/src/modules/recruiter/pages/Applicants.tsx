import React, { useState, useEffect } from 'react';
import { useApplicants, type Applicant } from '../hooks/useApplicants';
import ApplicantTable from '../components/ApplicantTable';
import MessageModal from '../components/MessageModal';
import InterviewModal from '../components/InterviewModal';
import api from '../../../lib/api';
import { useToast } from '../../../components/ui/toast';

export default function Applicants() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobId, setJobId] = useState('all');
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showMsgModal, setShowMsgModal] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get(`/jobs/my`);
        setJobs(res.data || []);
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      }
    };
    fetchJobs();
  }, []);

  const { data, loading, error, updateStatus } = useApplicants(jobId);

  const handleMessage = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowMsgModal(true);
  };

  const handleSchedule = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setShowInterviewModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applicants</h1>
        <select
          className="w-full md:w-64 p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="all">All Applications</option>
          {jobs.map(job => (
            <option key={job.id || job._id} value={job.id || job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading applicants...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && (
        <ApplicantTable 
          data={data} 
          onUpdate={updateStatus} 
          onMessage={handleMessage}
          onSchedule={handleSchedule}
        />
      )}

      {showMsgModal && selectedApplicant && (
        <MessageModal
          recipientId={selectedApplicant.candidateId}
          recipientName={selectedApplicant.name}
          applicationId={selectedApplicant.id}
          jobId={selectedApplicant.jobId}
          onClose={() => setShowMsgModal(false)}
          onSuccess={() => {
            setShowMsgModal(false);
            toast({ title: 'Success', description: 'Message sent successfully', variant: 'success' });
          }}
        />
      )}

      {showInterviewModal && selectedApplicant && (
        <InterviewModal
          candidateId={selectedApplicant.candidateId}
          candidateName={selectedApplicant.name}
          applicationId={selectedApplicant.id}
          jobId={selectedApplicant.jobId}
          jobTitle={selectedApplicant.jobTitle || 'Position'}
          onClose={() => setShowInterviewModal(false)}
          onSuccess={() => {
            setShowInterviewModal(false);
            toast({ title: 'Success', description: 'Interview scheduled successfully', variant: 'success' });
          }}
        />
      )}
    </div>
  );
}


