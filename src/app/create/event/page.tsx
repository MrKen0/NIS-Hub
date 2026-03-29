"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import EventForm, { type EventFormData } from '@/components/EventForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { createEvent } from '@/services/eventService';
import type { EventCategory } from '@/types/content';

export default function CreateEventPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: EventFormData) => {
    if (!user) return;

    await createEvent({
      title: data.title,
      description: data.description,
      date: data.date,
      time: data.time,
      location: data.location,
      category: data.category as EventCategory,
      organiser: data.organiser,
      contactLink: data.contactLink,
      expiresAt: data.expiresAt,
      authorId: user.uid,
    });

    setSuccess(true);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Post an Event</h1>
          <p className="text-sm text-slate-600 mb-6">Share community events, gatherings, and activities.</p>

          {success ? (
            <StateMessage
              type="success"
              title="Event posted!"
              message="Your event is pending review and will be visible once approved."
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    Post another
                  </button>
                  <button
                    onClick={() => router.push('/')}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    Go home
                  </button>
                </div>
              }
            />
          ) : (
            <EventForm
              defaultValues={{
                organiser: profile?.displayName ?? '',
                contactLink: profile?.phone ? `https://wa.me/${profile.phone.replace(/[^0-9]/g, '')}` : '',
              }}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
