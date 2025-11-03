import React from 'react';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';

interface JobFilterBarProps {
  query: string;
  status: string;
  onChange: (next: { query?: string; status?: string }) => void;
}

export default function JobFilterBar({ query, status, onChange }: JobFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <Input
        placeholder="Search job title…"
        value={query}
        onChange={(e) => onChange({ query: e.target.value })}
      />
      <select
        className="rounded-md border border-gray-300 px-3 py-2 text-sm"
        value={status}
        onChange={(e) => onChange({ status: e.target.value })}
      >
        <option value="all">All</option>
        <option value="Active">Active</option>
        <option value="Draft">Draft</option>
        <option value="Closed">Closed</option>
      </select>
      <Button variant="outline" onClick={() => onChange({ query: '', status: 'all' })}>Clear</Button>
    </div>
  );
}


