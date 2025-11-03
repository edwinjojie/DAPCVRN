import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { Job } from '../hooks/useJobs';

interface JobCardProps {
  job: Job;
  onEdit: (job: Job) => void;
  onDelete: (job: Job) => void;
}

const statusColor: Record<Job['status'], string> = {
  Active: 'bg-green-100 text-green-800',
  Closed: 'bg-gray-100 text-gray-800',
  Draft: 'bg-amber-100 text-amber-800',
};

export default function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="text-base">{job.title}</CardTitle>
        <span className={`px-2 py-1 rounded text-xs font-medium ${statusColor[job.status]}`}>{job.status}</span>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
        <div className="text-xs text-gray-500">Created {new Date(job.createdAt).toLocaleString()}</div>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => onEdit(job)}>Edit</Button>
          <Button size="sm" variant="outline" onClick={() => onDelete(job)}>Delete</Button>
        </div>
      </CardContent>
    </Card>
  );
}


