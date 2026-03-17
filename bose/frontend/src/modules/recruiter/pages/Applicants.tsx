import React, { useState, useEffect } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import ApplicantTable from '../components/ApplicantTable';
import api from '../../../lib/api';

export default function Applicants() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobId, setJobId] = useState('');
  
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
        const res = await api.get(`${baseUrl}/api/jobs/my`);
        setJobs(res.data || []);
        if (res.data?.length > 0 && !jobId) {
          setJobId(res.data[0].id || res.data[0]._id);
        }
      } catch (error) {
        console.error('Failed to fetch jobs', error);
      }
    };
    fetchJobs();
  }, []);

  const { data, loading, error, updateStatus } = useApplicants(jobId);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Applicants</h1>
        <select
          className="rounded-md border border-gray-300 px-3 py-2 text-sm max-w-sm"
          value={jobId}
          onChange={(e) => setJobId(e.target.value)}
        >
          <option value="" disabled>Select a job...</option>
          {jobs.map(job => (
            <option key={job.id || job._id} value={job.id || job._id}>
              {job.title}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Loading applicants...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && <ApplicantTable data={data} onUpdate={updateStatus} />}
    </div>
  );
}


