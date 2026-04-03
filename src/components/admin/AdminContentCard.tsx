"use client";

import StatusChip from '@/components/StatusChip';
import type { ContentStatus } from '@/types/content';

interface DetailRow {
  label: string;
  value: string;
}

interface Props {
  title: string;
  subtitle?: string;
  status: ContentStatus;
  createdAt: string;
  details: DetailRow[];
  bodyPreview?: string;
  selected?: boolean;
  onSelect?: (checked: boolean) => void;
  onApprove?: () => void;
  onReject?: () => void;
  onPause?: () => void;
  onArchive?: () => void;
}

function formatDate(iso: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminContentCard({
  title,
  subtitle,
  status,
  createdAt,
  details,
  bodyPreview,
  selected,
  onSelect,
  onApprove,
  onReject,
  onPause,
  onArchive,
}: Props) {
  // Determine which actions are available based on current status
  const showApprove = status === 'pending' || status === 'rejected' || status === 'paused';
  const showReject = status === 'pending' || status === 'approved';
  const showPause = status === 'approved';
  const showArchive = status !== 'archived';

  return (
    <div
      data-testid="content-card"
      className={`rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm transition-shadow${selected ? ' ring-2 ring-emerald-500/30' : ''}`}
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        {onSelect && (
          <label className="flex items-center justify-center min-w-[44px] min-h-[44px] -ml-1 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={selected ?? false}
              onChange={(e) => onSelect(e.target.checked)}
              className="w-4 h-4 rounded accent-emerald-600"
            />
          </label>
        )}
        <div className="min-w-0 flex-1">
          <h3 data-testid="card-title" className="font-semibold text-slate-900 line-clamp-1">{title}</h3>
          {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusChip status={status} />
        </div>
      </div>

      {/* Body preview */}
      {bodyPreview && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">{bodyPreview}</p>
      )}

      {/* Details grid */}
      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
          {details.map((d) => (
            <div key={d.label} className="flex gap-1">
              <span className="text-slate-400">{d.label}:</span>
              <span className="text-slate-700 font-medium truncate">{d.value}</span>
            </div>
          ))}
          <div className="flex gap-1">
            <span className="text-slate-400">Created:</span>
            <span className="text-slate-700 font-medium">{formatDate(createdAt)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {status !== 'archived' && (
        <div className="flex flex-wrap gap-2 pt-3 border-t border-slate-100">
          {showApprove && onApprove && (
            <button
              onClick={onApprove}
              data-testid="approve-btn"
              className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition min-h-[44px]"
            >
              Approve
            </button>
          )}
          {showReject && onReject && (
            <button
              onClick={onReject}
              data-testid="reject-btn"
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition min-h-[44px]"
            >
              Reject
            </button>
          )}
          {showPause && onPause && (
            <button
              onClick={onPause}
              data-testid="pause-btn"
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition min-h-[44px]"
            >
              Pause
            </button>
          )}
          {showArchive && onArchive && (
            <button
              onClick={onArchive}
              data-testid="archive-btn"
              className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition min-h-[44px]"
            >
              Archive
            </button>
          )}
        </div>
      )}

      {status === 'archived' && (
        <p className="text-xs text-slate-400 pt-3 border-t border-slate-100">Archived — no actions available</p>
      )}
    </div>
  );
}
