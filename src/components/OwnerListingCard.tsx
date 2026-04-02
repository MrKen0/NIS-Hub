"use client";

import Link from 'next/link';
import type { ContentStatus } from '@/types/content';

interface OwnerListingCardProps {
  type: 'service' | 'product';
  id: string;
  /** businessName for services; title for products */
  title: string;
  category: string;
  status: ContentStatus;
  expiresAt: string;
  createdAt: string;
  lastRepublishedAt?: string | null;
  /** First image URL (products only) */
  imageUrl?: string;
  onBoost: (id: string) => Promise<void>;
  boosting?: boolean;
}

// ---------- Status chip ----------

const STATUS_CONFIG: Record<ContentStatus, { label: string; bg: string; color: string }> = {
  approved: { label: 'Approved',  bg: '#D1FAE5', color: '#065F46' },
  pending:  { label: 'Pending',   bg: '#FEF3C7', color: '#92400E' },
  rejected: { label: 'Rejected',  bg: '#FEE2E2', color: '#991B1B' },
  paused:   { label: 'Paused',    bg: '#F3F4F6', color: '#374151' },
  archived: { label: 'Archived',  bg: '#F3F4F6', color: '#9CA3AF' },
};

function StatusChip({ status }: { status: ContentStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
  return (
    <span
      className="inline-block rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide"
      style={{ backgroundColor: cfg.bg, color: cfg.color }}
    >
      {cfg.label}
    </span>
  );
}

// ---------- Date formatter ----------

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

// ---------- Boost hint for ineligible statuses ----------

const BOOST_BLOCKED_HINT: Partial<Record<ContentStatus, string>> = {
  pending:  'Under review — boost available once approved.',
  rejected: 'Rejected — edit your listing to resubmit.',
  paused:   'Paused — contact an admin to reactivate.',
  archived: 'Archived — this listing cannot be boosted.',
};

// ---------- Component ----------

export default function OwnerListingCard({
  type,
  id,
  title,
  category,
  status,
  expiresAt,
  createdAt,
  lastRepublishedAt,
  imageUrl,
  onBoost,
  boosting = false,
}: OwnerListingCardProps) {
  const editHref = `/my-listings/${type === 'service' ? 'services' : 'products'}/${id}/edit`;
  const canBoost = status === 'approved';
  const isArchived = status === 'archived';
  const boostHint = BOOST_BLOCKED_HINT[status];

  const handleBoost = async () => {
    if (!canBoost || boosting) return;
    await onBoost(id);
  };

  return (
    <div
      data-testid="owner-listing-card"
      className="rounded-2xl p-4 flex gap-3"
      style={{
        backgroundColor: '#FEFDFB',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
        opacity: isArchived ? 0.65 : 1,
      }}
    >
      {/* Product thumbnail */}
      {type === 'product' && imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="w-16 h-16 rounded-xl object-cover flex-shrink-0 self-start"
        />
      )}

      <div className="flex-1 min-w-0">
        {/* Title + status */}
        <div className="flex items-start gap-2 flex-wrap">
          <p
            data-testid="owner-card-title"
            className="font-semibold text-sm leading-snug flex-1 min-w-0"
            style={{ color: 'var(--color-text)' }}
          >
            {title}
          </p>
          <StatusChip status={status} />
        </div>

        {/* Category */}
        <p className="mt-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
          {category}
        </p>

        {/* Dates */}
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs" style={{ color: 'var(--color-muted)' }}>
          <span>Listed {fmtDate(createdAt)}</span>
          <span>Expires {fmtDate(expiresAt)}</span>
          {lastRepublishedAt && (
            <span style={{ color: 'var(--color-primary)' }}>
              Last boosted {fmtDate(lastRepublishedAt)}
            </span>
          )}
        </div>

        {/* Action row */}
        {isArchived ? (
          <p className="mt-3 text-xs" style={{ color: 'var(--color-muted)' }}>
            This listing is archived and cannot be edited or boosted.
          </p>
        ) : (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {/* Edit link */}
            <Link
              href={editHref}
              className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold transition-colors hover:bg-slate-50 min-h-[36px]"
              style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
            >
              Edit listing
            </Link>

            {/* Boost button — only visible for approved */}
            {canBoost ? (
              <button
                data-testid="boost-btn"
                type="button"
                onClick={handleBoost}
                disabled={boosting}
                className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors min-h-[36px] disabled:opacity-60"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                {boosting ? 'Boosting…' : 'Boost listing'}
              </button>
            ) : boostHint ? (
              <p className="text-xs italic" style={{ color: 'var(--color-muted)' }}>
                {boostHint}
              </p>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
