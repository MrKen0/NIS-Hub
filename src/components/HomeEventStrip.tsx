"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getApprovedEvents } from '@/services/browseService';
import type { CommunityEvent } from '@/types/content';

function fmtDay(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric' });
}

function fmtMonthYear(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

export default function HomeEventStrip() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getApprovedEvents(5)
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (!loading && events.length === 0) return null;

  return (
    <div data-animate style={{ '--anim-delay': '100ms' } as React.CSSProperties}>
      {!loading && (
        <p
          className="text-xs font-bold uppercase tracking-widest mb-3"
          style={{ color: 'var(--color-muted)' }}
        >
          Upcoming Events
        </p>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 mb-4">
        {loading
          ? [1, 2, 3].map((i) => (
              <div
                key={i}
                className="w-52 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-pulse"
              >
                <div className="h-8 w-12 bg-slate-200 rounded mb-3" />
                <div className="h-4 w-full bg-slate-100 rounded mb-1" />
                <div className="h-4 w-3/4 bg-slate-100 rounded mb-3" />
                <div className="h-3 w-1/2 bg-slate-100 rounded" />
              </div>
            ))
          : events.map((event) => (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className="w-52 flex-shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col gap-1 hover:border-emerald-300 transition-colors"
                style={{ textDecoration: 'none' }}
              >
                {/* Date block */}
                <div className="mb-1">
                  <span
                    className="block text-2xl font-bold leading-none"
                    style={{ color: 'var(--brand-primary, #008753)' }}
                  >
                    {fmtDay(event.date)}
                  </span>
                  <span className="text-xs text-slate-500">{fmtMonthYear(event.date)}</span>
                </div>

                {/* Title */}
                <p className="text-sm font-semibold text-slate-900 line-clamp-2 flex-1">
                  {event.title}
                </p>

                {/* Location */}
                <p className="text-xs text-slate-500 line-clamp-1">{event.location}</p>

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
