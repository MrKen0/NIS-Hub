"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApprovedNotices } from '@/services/browseService';
import type { CommunityNotice } from '@/types/content';

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function HomeNoticeStrip() {
  const [notices, setNotices] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedNotices(5)
      .then(setNotices)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && notices.length === 0) return null;

  return (
    <div data-animate style={{ '--anim-delay': '120ms' } as React.CSSProperties}>
      {!loading && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-muted)' }}
        >
          Community Notices
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-52 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
              >
                <div className="h-5 w-20 bg-slate-200 rounded-full mb-3" />
                <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                <div className="h-4 w-3/4 bg-slate-100 rounded mb-3" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            ))
          : notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notices/${notice.id}`}
                className="w-52 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1 hover:border-emerald-300 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {/* Category pill */}
                <span
                  className="self-start rounded-full px-2 py-0.5 text-xs font-semibold text-white mb-1"
                  style={{ backgroundColor: 'var(--brand-primary, #008753)' }}
                >
                  {notice.category}
                </span>

                {/* Title */}
                <p className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">
                  {notice.title}
                </p>

                {/* Date */}
                <p className="text-xs text-slate-500">{fmtDate(notice.createdAt)}</p>

                {/* CTA */}
                <p
                  className="text-xs font-semibold mt-1"
                  style={{ color: 'var(--brand-primary, #008753)' }}
                >
                  View →
                </p>
              </Link>
            ))}
      </div>
    </div>
  );
}
