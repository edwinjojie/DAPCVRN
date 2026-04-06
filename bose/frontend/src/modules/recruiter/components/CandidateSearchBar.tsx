import React from 'react';
import { Search } from 'lucide-react';

interface Props {
  onSearch: (filters: Record<string, any>) => void;
}

export default function CandidateSearchBar({ onSearch }: Props) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement & {
      keyword: HTMLInputElement;
      location: HTMLInputElement;
    };
    onSearch({
      keyword: form.keyword.value,
      location: form.location.value,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-center bg-slate-50 p-4 rounded-xl border border-slate-200">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          name="keyword"
          placeholder="Search by name or skill"
          className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
      </div>
      <input
        name="location"
        placeholder="Location"
        className="px-3 py-2.5 rounded-lg border border-slate-300 w-48 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
      />
      <button type="submit" className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-colors">
        Search
      </button>
    </form>
  );
}
