"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedEvents } from '@/services/browseService';
import type { CommunityEvent } from '@/types/content';

// ─── Day-level today helper ───────────────────────────────────────────────────
// Returns YYYY-MM-DD so comparisons against ev.date (also YYYY-MM-DD) are
// day-accurate — events happening today are never treated as past.
function todayStr() {
  return new Date().toISOString().substring(0, 10);
}

// ─── Date / time formatters ───────────────────────────────────────────────────
function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ─── Demo events — shown only when no real events exist ──────────────────────
const DEMO_EVENTS = [
  {
    id: 'demo-1',
    title: 'Naija Jollof Night',
    description:
      'An evening of great food, music, and community. Bring a dish to share and enjoy the flavours of home.',
    date: '2026-05-10',
    time: '18:00',
    location: 'Stevenage Leisure Centre, Town Centre',
    category: 'Community Gathering',
    organiser: 'NIS Hub',
  },
  {
    id: 'demo-2',
    title: 'Kids Football & Sports Day',
    description:
      'Fun football sessions for children aged 5–14. Parents welcome. Organised by community volunteers.',
    date: '2026-05-24',
    time: '10:00',
    location: 'Fairlands Valley Park',
    category: 'Sports',
    organiser: 'NIS Hub',
  },
  {
    id: 'demo-3',
    title: 'Money & Finance Workshop',
    description:
      'Practical guidance on budgeting, savings, and building credit in the UK. Open to all community members.',
    date: '2026-06-07',
    time: '14:00',
    location: 'Stevenage Central Library',
    category: 'Workshop',
    organiser: 'NIS Hub',
  },
] as const;

// ─── Inline helper: compact stat card ────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div
      className="rounded-xl border p-3 text-center"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <p
        className="text-2xl font-bold leading-none"
        style={{ color: 'var(--color-primary)' }}
      >
        {value}
      </p>
      <p className="mt-1 text-xs" style={{ color: 'var(--color-muted)' }}>
        {label}
      </p>
    </div>
  );
}

// ─── Inline helper: date badge ────────────────────────────────────────────────
function DateBadge({ date }: { date: string }) {
  const d = new Date(date);
  return (
    <div
      className="flex-shrink-0 w-14 h-14 rounded-xl flex flex-col items-center justify-center"
      style={{
        backgroundColor: 'var(--color-primary-surface)',
        border: '1px solid rgba(0,135,83,0.18)',
      }}
    >
      <span
        className="text-lg font-bold leading-none"
        style={{ color: 'var(--color-primary)' }}
      >
        {d.getDate()}
      </span>
      <span
        className="text-xs font-semibold uppercase"
        style={{ color: 'var(--color-primary-dark)', opacity: 0.75 }}
      >
        {d.toLocaleDateString('en-GB', { month: 'short' })}
      </span>
    </div>
  );
}

// ─── Inline helper: featured event card ──────────────────────────────────────
function FeaturedEventCard({ event }: { event: CommunityEvent }) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="flex gap-3 rounded-xl p-4 transition-all hover:shadow-md"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        borderTopWidth: '2px',
        borderTopColor: 'var(--color-primary-surface)',
        borderLeftWidth: '3px',
        borderLeftColor: 'var(--color-primary)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <DateBadge date={event.date} />
      <div className="flex-1 min-w-0">
        <h3 className="font-bold text-slate-900 line-clamp-1 mb-0.5">{event.title}</h3>
        <p className="text-xs text-slate-500 mb-1">
          {formatDate(event.date)} at {formatTime(event.time)} &middot; {event.location}
        </p>
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-medium rounded-full px-2 py-0.5"
            style={{
              backgroundColor: 'var(--color-primary-surface)',
              color: 'var(--color-primary-dark)',
            }}
          >
            {event.category}
          </span>
          {event.organiser && (
            <span className="text-xs text-slate-400">by {event.organiser}</span>
          )}
          {event.rsvpCount > 0 && (
            <span className="text-xs text-slate-400">{event.rsvpCount} going</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ─── Inline helper: demo event card (non-clickable) ──────────────────────────
function DemoEventCard({ event }: { event: (typeof DEMO_EVENTS)[number] }) {
  return (
    <div
      className="flex gap-3 rounded-xl p-4 opacity-80"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <DateBadge date={event.date} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5 flex-wrap">
          <h3 className="font-bold text-slate-900 line-clamp-1">{event.title}</h3>
          <span
            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
            style={{
              backgroundColor: 'rgba(207,175,90,0.18)',
              color: '#7a5c1e',
              border: '1px solid rgba(207,175,90,0.35)',
            }}
          >
            Example
          </span>
        </div>
        <p className="text-xs text-slate-500 mb-1">
          {formatDate(event.date)} at {formatTime(event.time)} &middot; {event.location}
        </p>
        <p className="text-sm text-slate-600 line-clamp-2">{event.description}</p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function EventsBrowsePage() {
  const [events, setEvents] = useState<CommunityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getApprovedEvents()
      .then(setEvents)
      .catch(() => setError('Failed to load events.'))
      .finally(() => setLoading(false));
  }, []);

  // Upcoming — date >= today (day-level, inclusive of today)
  const upcoming = useMemo(
    () => events.filter((e) => e.date >= todayStr()),
    [events]
  );

  // Stats — derived from upcoming events only
  const stats = useMemo(
    () => ({
      upcoming:   upcoming.length,
      categories: new Set(upcoming.map((e) => e.category)).size,
      totalRsvps: upcoming.reduce((sum, e) => sum + (e.rsvpCount ?? 0), 0),
    }),
    [upcoming]
  );

  // Featured — 3 soonest upcoming events
  const featured = useMemo(
    () =>
      [...upcoming]
        .sort((a, b) => a.date.localeCompare(b.date))
        .slice(0, 3),
    [upcoming]
  );

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto space-y-6 pb-8">

          {/* ── 1. Hero / Dashboard header ──────────────────────────── */}
          <section
            className="rounded-2xl p-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-surface) 0%, #d4ede1 100%)',
              border: '1px solid rgba(0,135,83,0.18)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Events
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-primary-dark)', opacity: 0.8 }}>
              Community gatherings, workshops, and celebrations near you.
            </p>
            <p className="mt-0.5 text-xs" style={{ color: 'var(--color-primary-dark)', opacity: 0.6 }}>
              Bring people together. Build real connections.
            </p>
            <div className="mt-4">
              <Link
                href="/create/event"
                className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] inline-flex items-center"
                style={{ backgroundColor: 'var(--color-primary)' }}
              >
                + Post Event
              </Link>
            </div>
          </section>

          {/* ── 2. Summary stats — from upcoming events only ─────────── */}
          {!loading && !error && upcoming.length > 0 && (
            <div className="grid grid-cols-3 gap-3">
              <StatCard label="Upcoming"    value={stats.upcoming} />
              <StatCard label="Categories"  value={stats.categories} />
              <StatCard label="Total RSVPs" value={stats.totalRsvps} />
            </div>
          )}

          {/* ── 3. Coming up — 3 soonest upcoming events ────────────── */}
          {!loading && !error && featured.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">Coming up</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  The next events happening in the community.
                </p>
              </div>
              <div className="space-y-3">
                {featured.map((ev) => (
                  <FeaturedEventCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          )}

          {/* ── Loading skeleton ─────────────────────────────────────── */}
          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 bg-slate-200 rounded-xl" />
                    <div className="flex-1">
                      <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Error ───────────────────────────────────────────────── */}
          {error && <StateMessage type="error" title="Error" message={error} />}

          {/* ── Demo events — shown only when no real events exist ───── */}
          {!loading && !error && events.length === 0 && (
            <section>
              <div
                className="rounded-xl p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
                style={{
                  backgroundColor: 'rgba(207,175,90,0.10)',
                  border: '1px solid rgba(207,175,90,0.35)',
                }}
              >
                <div>
                  <p className="text-sm font-semibold" style={{ color: '#7a5c1e' }}>
                    No events yet — here&apos;s what they&apos;ll look like
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: '#7a5c1e', opacity: 0.8 }}>
                    Post the first real event and it will appear here for the whole community.
                  </p>
                </div>
                <Link
                  href="/create/event"
                  className="shrink-0 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 min-h-[44px] flex items-center"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  + Post the first event
                </Link>
              </div>
              <div className="space-y-3">
                {DEMO_EVENTS.map((ev) => (
                  <DemoEventCard key={ev.id} event={ev} />
                ))}
              </div>
            </section>
          )}

          {/* ── 4. All events list ───────────────────────────────────── */}
          {!loading && events.length > 0 && (
            <section>
              <div className="mb-3">
                <h2 className="text-base font-bold text-slate-900">All events</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Browse every upcoming community event.
                </p>
              </div>
              <div className="space-y-3">
                {events.map((ev) => {
                  const isPast = ev.date < todayStr();
                  return (
                    <Link
                      key={ev.id}
                      href={`/events/${ev.id}`}
                      data-testid="event-card"
                      className={`flex gap-3 rounded-xl border border-slate-200 p-4 shadow-sm hover:border-blue-300 transition-all card-lift ${isPast ? 'opacity-60' : ''}`}
                      style={{ backgroundColor: '#FEFDFB' }}
                    >
                      <DateBadge date={ev.date} />
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-slate-900 line-clamp-1">{ev.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {formatDate(ev.date)} at {formatTime(ev.time)} &middot; {ev.location}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-slate-400">{ev.category}</span>
                          {ev.organiser && (
                            <span className="text-xs text-slate-400">by {ev.organiser}</span>
                          )}
                          {ev.rsvpCount > 0 && (
                            <span className="text-xs text-slate-400">{ev.rsvpCount} going</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

        </div>
      </AppShell>
    </AuthGuard>
  );
}
