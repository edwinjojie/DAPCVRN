import React, { useState, useEffect } from 'react';
import { useApplicants } from '../hooks/useApplicants';
import ApplicantTable from '../components/ApplicantTable';
import api from '../../../lib/api';

export default function Applicants() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [jobId, setJobId] = useState('all');
  
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
      {!loading && !error && <ApplicantTable data={data} onUpdate={updateStatus} />}
    </div>
  );
}


