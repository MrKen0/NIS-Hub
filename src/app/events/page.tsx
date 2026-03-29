"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getApprovedEvents } from '@/services/browseService';
import type { CommunityEvent } from '@/types/content';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
}

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

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

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Events</h1>
              <p className="text-sm text-slate-600">Community gatherings and activities</p>
            </div>
            <Link
              href="/create/event"
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors min-h-[44px] flex items-center"
            >
              + Post Event
            </Link>
          </div>

          {loading && (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border border-slate-200 bg-white p-4 animate-pulse">
                  <div className="flex gap-3">
                    <div className="h-14 w-14 bg-slate-200 rounded-lg" />
                    <div className="flex-1">
                      <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
                      <div className="h-4 w-1/2 bg-slate-100 rounded" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {error && <StateMessage type="error" title="Error" message={error} />}

          {!loading && !error && events.length === 0 && (
            <StateMessage
              type="empty"
              title="No upcoming events"
              message="Be the first to post a community event."
              action={
                <Link href="/create/event" className="text-sm font-medium text-blue-600 underline">
                  Post an event
                </Link>
              }
            />
          )}

          {!loading && events.length > 0 && (
            <div className="space-y-3">
              {events.map((ev) => {
                const isPast = new Date(ev.date) < new Date();
                return (
                  <Link
                    key={ev.id}
                    href={`/events/${ev.id}`}
                    className={`flex gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm hover:border-blue-300 hover:shadow-md transition-all ${isPast ? 'opacity-60' : ''}`}
                  >
                    {/* Date badge */}
                    <div className="flex-shrink-0 w-14 h-14 rounded-lg bg-blue-50 flex flex-col items-center justify-center text-blue-700">
                      <span className="text-lg font-bold leading-none">{new Date(ev.date).getDate()}</span>
                      <span className="text-xs font-medium uppercase">{new Date(ev.date).toLocaleDateString('en-GB', { month: 'short' })}</span>
                    </div>
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
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
