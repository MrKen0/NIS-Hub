"use client";

import { useEffect, useState } from 'react';
import StateMessage from '@/components/StateMessage';
import { getModerationHistory } from '@/services/moderationService';
import type { ModerationAction, ModerationActionType, ModerationTargetType } from '@/types/moderation';

const ACTION_TYPE_OPTIONS: { value: ModerationActionType | ''; label: string }[] = [
  { value: '', label: 'All actions' },
  { value: 'approve', label: 'Approve' },
  { value: 'reject', label: 'Reject' },
  { value: 'pause', label: 'Pause' },
  { value: 'archive', label: 'Archive' },
  { value: 'restore', label: 'Restore' },
  { value: 'role_change', label: 'Role Change' },
];

const TARGET_TYPE_OPTIONS: { value: ModerationTargetType | ''; label: string }[] = [
  { value: '', label: 'All types' },
  { value: 'serviceListing', label: 'Service' },
  { value: 'productListing', label: 'Product' },
  { value: 'event', label: 'Event' },
  { value: 'notice', label: 'Notice' },
  { value: 'request', label: 'Request' },
  { value: 'user', label: 'User' },
];

const ACTION_LABELS: Record<string, string> = {
  approve: 'Approved',
  reject: 'Rejected',
  pause: 'Paused',
  archive: 'Archived',
  restore: 'Restored',
  role_change: 'Role Changed',
};

const TARGET_LABELS: Record<string, string> = {
  serviceListing: 'Service',
  productListing: 'Product',
  event: 'Event',
  notice: 'Notice',
  request: 'Request',
  user: 'User',
};

const ACTION_STYLES: Record<string, string> = {
  approve: 'bg-green-100 text-green-800',
  reject: 'bg-red-100 text-red-800',
  pause: 'bg-orange-100 text-orange-800',
  archive: 'bg-slate-100 text-slate-600',
  restore: 'bg-blue-100 text-blue-800',
  role_change: 'bg-purple-100 text-purple-800',
};

function formatDateTime(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
    + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}

export default function AdminHistoryPanel() {
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [actionFilter, setActionFilter] = useState<ModerationActionType | ''>('');
  const [targetFilter, setTargetFilter] = useState<ModerationTargetType | ''>('');

  useEffect(() => {
    setLoading(true);
    setError('');

    const filters: { actionType?: ModerationActionType; targetType?: ModerationTargetType } = {};
    if (actionFilter) filters.actionType = actionFilter;
    if (targetFilter) filters.targetType = targetFilter;

    getModerationHistory(filters)
      .then(setActions)
      .catch(() => setError('Failed to load moderation history.'))
      .finally(() => setLoading(false));
  }, [actionFilter, targetFilter]);

  return (
    <div>
      {/* Filters */}
      <div className="flex gap-2 mb-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value as ModerationActionType | '')}
          className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px]"
          aria-label="Filter by action type"
        >
          {ACTION_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
        <select
          value={targetFilter}
          onChange={(e) => setTargetFilter(e.target.value as ModerationTargetType | '')}
          className="flex-1 min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 min-h-[44px]"
          aria-label="Filter by target type"
        >
          {TARGET_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Loading skeleton */}
      {loading && (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
              <div className="h-4 w-1/3 bg-slate-200 rounded mb-2" />
              <div className="h-3 w-2/3 bg-slate-100 rounded mb-1" />
              <div className="h-3 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && <StateMessage type="error" title="Error" message={error} />}

      {/* Empty state */}
      {!loading && !error && actions.length === 0 && (
        <StateMessage
          type="empty"
          title="No moderation history"
          message={actionFilter || targetFilter
            ? 'No actions match the selected filters.'
            : 'No moderation actions have been recorded yet.'}
        />
      )}

      {/* History list */}
      {!loading && actions.length > 0 && (
        <div className="space-y-3">
          {actions.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              {/* Top row: action badge + target type + date */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${ACTION_STYLES[a.actionType] ?? 'bg-slate-100 text-slate-600'}`}>
                    {ACTION_LABELS[a.actionType] ?? a.actionType}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {TARGET_LABELS[a.targetType] ?? a.targetType}
                  </span>
                </div>
                <span className="text-xs text-slate-400 whitespace-nowrap">
                  {formatDateTime(a.createdAt)}
                </span>
              </div>

              {/* Change details */}
              <div className="text-sm text-slate-700 mb-1">
                <span className="font-medium">{a.fieldChanged}</span>:{' '}
                <span className="text-slate-500">{a.previousValue}</span>
                {' \u2192 '}
                <span className="font-semibold">{a.newValue}</span>
              </div>

              {/* Target ID */}
              <p className="text-xs text-slate-400 mb-1 font-mono truncate">
                ID: {a.targetId}
              </p>

              {/* Moderator */}
              <p className="text-xs text-slate-500">
                by <span className="font-medium">{a.moderatorName}</span>
              </p>

              {/* Reason */}
              {a.reason && (
                <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                  <span className="font-medium">Reason:</span> {a.reason}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
