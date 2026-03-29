"use client";

import type { ContentStatus } from '@/types/content';

const FILTERS: { label: string; value: ContentStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'Paused', value: 'paused' },
  { label: 'Archived', value: 'archived' },
];

interface Props {
  value: ContentStatus | undefined;
  onChange: (v: ContentStatus | undefined) => void;
}

export default function StatusFilterBar({ value, onChange }: Props) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
      {FILTERS.map((f) => {
        const active = value === f.value;
        return (
          <button
            key={f.label}
            onClick={() => onChange(f.value)}
            data-testid={`filter-${f.value ?? 'all'}`}
            className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition min-h-[32px] ${
              active
                ? 'bg-slate-800 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </button>
        );
      })}
    </div>
  );
}
