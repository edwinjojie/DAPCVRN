import React from 'react';
import type { Candidate } from '../hooks/useCandidateSearch';

interface Props {
  data: Candidate[];
  onView: (id: string) => void;
}

export default function CandidateTable({ data, onView }: Props) {
  if (!data.length) return <div className="text-gray-500 text-center py-10">No candidates found.</div>;

  return (
    <div className="overflow-x-auto rounded-xl border border-gray-200">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-50 text-gray-500">
          <tr>
            <th className="p-3">Name</th>
            <th className="p-3">Skills</th>
            <th className="p-3">Location</th>
            <th className="p-3">Experience</th>
            <th className="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((c) => (
            <tr key={c.id} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">
                <button
                  className="text-blue-600 hover:text-blue-800 font-medium hover:underline text-left"
                  onClick={() => onView(c.id)}
                >
                  {c.name}
                </button>
              </td>
              <td className="p-3">
                <div className="flex flex-wrap gap-1">
                  {c.skills.slice(0, 3).map((s, i) => (
                    <span key={i} className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">{s}</span>
                  ))}
                  {c.skills.length > 3 && <span className="text-xs text-slate-400">+{c.skills.length - 3}</span>}
                </div>
              </td>
              <td className="p-3 text-gray-600">{c.location}</td>
              <td className="p-3 text-gray-600">{c.experience} yrs</td>
              <td className="p-3">
                <button
                  className="px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50 text-sm font-medium"
                  onClick={() => onView(c.id)}
                >
                  View Profile
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
