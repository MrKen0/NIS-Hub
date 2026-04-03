"use client";

import type { ContentStatus } from '@/types/content';

interface Props {
  selectedCount: number;
  statusFilter: ContentStatus | undefined;
  onBulkAction: (action: ContentStatus) => void;
  onClearSelection: () => void;
  disabled?: boolean;
}

function getActions(statusFilter: ContentStatus | undefined): ContentStatus[] {
  switch (statusFilter) {
    case 'pending':  return ['approved', 'rejected', 'archived'];
    case 'approved': return ['paused', 'archived'];
    case 'paused':   return ['approved', 'archived'];
    case 'rejected': return ['approved', 'archived'];
    case 'archived': return [];
    default:         return ['archived'];
  }
}

const ACTION_COLORS: Record<string, string> = {
  approved: 'bg-green-600 hover:bg-green-700',
  rejected: 'bg-red-600 hover:bg-red-700',
  paused:   'bg-orange-500 hover:bg-orange-600',
  archived: 'bg-slate-500 hover:bg-slate-600',
};

const ACTION_LABELS: Record<string, string> = {
  approved: 'Approve',
  rejected: 'Reject',
  paused:   'Pause',
  archived: 'Archive',
};

export default function AdminBulkActionBar({
  selectedCount,
  statusFilter,
  onBulkAction,
  onClearSelection,
  disabled,
}: Props) {
  if (selectedCount === 0 || statusFilter === 'archived') return null;

  const actions = getActions(statusFilter);
  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 mb-3">
      {actions.map((action) => (
        <button
          key={action}
          onClick={() => onBulkAction(action)}
          disabled={disabled}
          className={`rounded-lg px-3 py-1.5 text-sm font-semibold text-white transition min-h-[36px] disabled:opacity-50 ${ACTION_COLORS[action]}`}
        >
          {ACTION_LABELS[action]} {selectedCount}
        </button>
      ))}
      <div className="flex items-center gap-2 ml-auto text-sm text-slate-500">
        <span>{selectedCount} selected</span>
        <button
          onClick={onClearSelection}
          disabled={disabled}
          className="text-slate-400 hover:text-slate-600 transition font-bold text-base disabled:opacity-50"
          aria-label="Clear selection"
        >
          ×
        </button>
      </div>
    </div>
  );
}
