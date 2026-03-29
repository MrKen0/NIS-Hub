"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import HelpRequestForm, { type HelpRequestFormData } from '@/components/HelpRequestForm';
import StateMessage from '@/components/StateMessage';
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
          <h1 className="text-2xl font-bold text-slate-900 mb-1">Post a Request</h1>
          <p className="text-sm text-slate-600 mb-6">Ask the community for help, goods, or services.</p>

          {requestId ? (
            <StateMessage
              type="success"
              title="Request posted!"
              message="Your request is pending review and will be visible once approved. In the meantime, see if we can match you with a service now."
              action={
                <div className="flex flex-col gap-3">
                  <button
                    data-testid="see-matches-btn"
                    onClick={() => router.push(`/requests/${requestId}/matches`)}
                    className="rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition min-h-[44px]"
                  >
                    See matching services
                  </button>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setRequestId(null)}
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
                </div>
              }
            />
          ) : (
            <HelpRequestForm
              defaultValues={{
                whatsapp: profile?.phone ?? '',
                phone: profile?.phone ?? '',
                location: profile?.area ?? '',
              }}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
