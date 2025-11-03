import React from 'react';
import { Button } from '../../components/ui/button';
import StatCard from './components/StatCard';
import ActivityFeed from './components/ActivityFeed';
import { useRecruiterSummary } from './hooks/useRecruiterSummary';

export default function RecruiterDashboard() {
  const { summary, activity, loading, error } = useRecruiterSummary();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recruiter Dashboard</h1>
          <p className="text-gray-600">Overview and quick actions</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => { window.location.hash = '#post-job'; }}>Post Job</Button>
          <Button variant="outline" onClick={() => { window.location.hash = '#search'; }}>Search Candidates</Button>
        </div>
      </div>

      {loading && (
        <div className="text-sm text-gray-500">Loading dashboard…</div>
      )}
      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Total Jobs" value={summary?.totalJobs ?? 0} color="blue" />
        <StatCard label="Open Jobs" value={summary?.openJobs ?? 0} color="green" />
        <StatCard label="Total Candidates" value={summary?.totalCandidates ?? 0} color="yellow" />
        <StatCard label="Verified Candidates" value={summary?.verifiedCandidates ?? 0} color="purple" />
      </div>

      <ActivityFeed items={activity} />
    </div>
  );
}


