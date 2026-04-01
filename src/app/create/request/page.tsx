"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import HelpRequestForm, { type HelpRequestFormData } from '@/components/HelpRequestForm';
import { useAuth } from '@/lib/auth/AuthContext';
import { createHelpRequest } from '@/services/helpRequestService';
import type { HelpRequest, StevenageArea } from '@/types/content';

export default function CreateRequestPage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleSubmit = async (data: HelpRequestFormData) => {
    if (!user) return;

    const id = await createHelpRequest({
      text: data.text,
      category: (data.category as HelpRequest['category']) || null,
      location: data.location as StevenageArea,
      urgency: data.urgency,
      preferredContact: data.preferredContact,
      whatsapp: data.whatsapp,
      phone: data.phone,
      authorId: user.uid,
    });

    setRequestId(id);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          {requestId ? (
            <SuccessScreen
              requestId={requestId}
              onPostAnother={() => setRequestId(null)}
            />
          ) : (
            <>
              <h1
                className="text-2xl font-bold mb-1"
                style={{ color: 'var(--color-text)' }}
              >
                Post a Request
              </h1>
              <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>
                Ask the community for help, goods, or services.
              </p>
              <HelpRequestForm
                defaultValues={{
                  whatsapp: profile?.phone ?? '',
                  phone: profile?.phone ?? '',
                  location: profile?.area ?? '',
                }}
                onSubmit={handleSubmit}
              />
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}

function SuccessScreen({
  requestId,
  onPostAnother,
}: {
  requestId: string;
  onPostAnother: () => void;
}) {
  const router = useRouter();

  return (
    <div className="rounded-2xl bg-white p-6 sm:p-8 text-center" style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}>
      {/* Checkmark */}
      <div
        className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
        style={{ background: 'var(--color-primary-surface)' }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2
        className="text-xl font-bold mb-2"
        style={{ color: 'var(--color-text)' }}
      >
        Request posted!
      </h2>
      <p className="text-sm leading-relaxed mb-6" style={{ color: 'var(--color-muted)' }}>
        Your request is pending review and will be visible once approved.
        In the meantime, see if we can match you with a service now.
      </p>

      <div className="flex flex-col gap-3">
        <button
          data-testid="see-matches-btn"
          onClick={() => router.push(`/requests/${requestId}/matches`)}
          className="w-full rounded-xl py-3 text-sm font-bold text-white transition-colors min-h-[44px]"
          style={{ background: 'var(--color-primary)' }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-dark)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
          }}
        >
          See matching services
        </button>

        <div className="flex gap-4 justify-center">
          <button
            onClick={onPostAnother}
            className="text-sm font-semibold underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Post another
          </button>
          <button
            onClick={() => router.push('/')}
            className="text-sm font-semibold underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Go home
          </button>
        </div>
      </div>
    </div>
  );
}
