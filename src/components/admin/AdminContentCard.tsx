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
  onApprove,
  onReject,
  onPause,
  onArchive,
}: Props) {
  const showApprove = status === 'pending' || status === 'rejected' || status === 'paused';
  const showReject = status === 'pending' || status === 'approved';
  const showPause = status === 'approved';
  const showArchive = status !== 'archived';

  return (
    <div
      data-testid="content-card"
      className="rounded-xl bg-white p-4 sm:p-5"
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3
            data-testid="card-title"
            className="font-semibold line-clamp-1"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm mt-0.5" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <StatusChip status={status} />
        </div>
      </div>

      {/* Body preview */}
      {bodyPreview && (
        <p className="text-sm line-clamp-2 mb-3" style={{ color: 'var(--color-muted)' }}>{bodyPreview}</p>
      )}

      {/* Details grid */}
      {details.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
          {details.map((d) => (
            <div key={d.label} className="flex gap-1">
              <span style={{ color: 'var(--color-muted)' }}>{d.label}:</span>
              <span className="font-medium truncate" style={{ color: 'var(--color-text)' }}>{d.value}</span>
            </div>
          ))}
          <div className="flex gap-1">
            <span style={{ color: 'var(--color-muted)' }}>Created:</span>
            <span className="font-medium" style={{ color: 'var(--color-text)' }}>{formatDate(createdAt)}</span>
          </div>
        </div>
      )}

      {/* Actions */}
      {status !== 'archived' && (
        <div
          className="flex flex-wrap gap-2 pt-3"
          style={{ borderTop: '1px solid var(--color-border)' }}
        >
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
        <p
          className="text-xs pt-3"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-muted)' }}
        >
          Archived — no actions available
        </p>
      )}
    </div>
  );
}
