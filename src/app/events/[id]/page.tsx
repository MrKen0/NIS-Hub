"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getEventById } from '@/services/browseService';
import type { CommunityEvent } from '@/types/content';
import ImageCarousel from '@/components/ImageCarousel';

// ─── Demo events ──────────────────────────────────────────────────────────────
// These mirror the DEMO_EVENTS in events/page.tsx. Duplicated locally to avoid
// a shared-module dependency between two independent route segments.
// All required CommunityEvent fields are filled with safe placeholder values so
// the detail page renders without TypeScript errors or runtime crashes.
const DEMO_EVENTS: CommunityEvent[] = [
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
    contactLink: '',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
    rsvpCount: 0,
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
    contactLink: '',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
    rsvpCount: 0,
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
    contactLink: '',
    expiresAt: '2099-12-31',
    linkUrl: null,
    imageUrls: null,
    status: 'approved',
    authorId: 'demo',
    createdAt: '2026-04-01T10:00:00.000Z',
    updatedAt: '2026-04-01T10:00:00.000Z',
    rsvpCount: 0,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDateLong(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

function formatTime(time: string) {
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? 'PM' : 'AM'}`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();

  const routeId = typeof params.id === 'string' ? params.id : '';

  // Resolve demo IDs synchronously — no loading state, no Firestore call.
  const demoEvent = DEMO_EVENTS.find((e) => e.id === routeId) ?? null;

  const [event, setEvent] = useState<CommunityEvent | null>(demoEvent);
  // If a demo event resolved, skip the loading skeleton entirely.
  const [loading, setLoading] = useState(demoEvent === null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!routeId) return;
    // Demo IDs are already resolved in initial state — skip Firestore.
    if (DEMO_EVENTS.some((e) => e.id === routeId)) return;

    getEventById(routeId)
      .then((ev) => {
        if (!ev || ev.status !== 'approved') {
          setNotFound(true);
        } else {
          setEvent(ev);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [routeId]);

  const isDemo = demoEvent !== null;
  const isPast = event ? new Date(event.date) < new Date() : false;

  const contactUrl = event?.contactLink
    ? event.contactLink.startsWith('http')
      ? event.contactLink
      : `https://wa.me/${event.contactLink.replace(/\D/g, '')}?text=${encodeURIComponent(
          `Hi! I'm interested in attending "${event.title}" on ${formatDateLong(event.date)}.`
        )}`
    : '';

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/2 bg-slate-100 rounded mb-6" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          )}

          {notFound && (
            <StateMessage
              type="empty"
              title="Event not found"
              message="This event may have been removed or is not yet approved."
              action={
                <button onClick={() => router.push('/events')} className="text-sm font-medium text-blue-600 underline">
                  Back to events
                </button>
              }
            />
          )}

          {event && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <div className="flex items-start justify-between gap-3 mb-1">
                  <h1 className="text-2xl font-bold">{event.title}</h1>
                  {/* Example badge — only shown for demo content */}
                  {isDemo && (
                    <span
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold self-start mt-0.5"
                      style={{
                        backgroundColor: 'rgba(207,175,90,0.25)',
                        color: '#f5d87a',
                        border: '1px solid rgba(207,175,90,0.5)',
                      }}
                    >
                      Example
                    </span>
                  )}
                </div>
                <p className="text-blue-100 text-sm">
                  {formatDateLong(event.date)} at {formatTime(event.time)}
                </p>
              </div>

              {/* Image carousel — only rendered when the event has photos */}
              {(event.imageUrls?.length ?? 0) > 0 && (
                <ImageCarousel
                  imageUrls={event.imageUrls!}
                  alt={event.title}
                  heightClass="h-64"
                  fit="contain"
                />
              )}

              <div className="p-6 space-y-5">
                {/* Info grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-500">Location</span>
                    <p className="font-medium text-slate-900">{event.location}</p>
                  </div>
                  <div>
                    <span className="text-slate-500">Category</span>
                    <p className="font-medium text-slate-900">{event.category}</p>
                  </div>
                  {event.organiser && (
                    <div>
                      <span className="text-slate-500">Organiser</span>
                      <p className="font-medium text-slate-900">{event.organiser}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-slate-500">RSVPs</span>
                    <p className="font-medium text-slate-900">{event.rsvpCount}</p>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">About This Event</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{event.description}</p>
                </div>

                {/* CTA */}
                {(!isPast && contactUrl) || event.linkUrl ? (
                  <div className="pt-4 border-t space-y-2">
                    {!isPast && contactUrl && (
                      <a
                        href={contactUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors min-h-[44px]"
                      >
                        RSVP / Contact Organiser
                      </a>
                    )}
                    {event.linkUrl && (
                      <a
                        href={event.linkUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                      >
                        Event link ↗
                      </a>
                    )}
                  </div>
                ) : null}

                {isPast && !isDemo && (
                  <div className="rounded-lg bg-slate-100 p-4 text-center">
                    <p className="text-slate-600 text-sm">This event has already taken place.</p>
                  </div>
                )}

                <button
                  onClick={() => router.push('/events')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to events
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
