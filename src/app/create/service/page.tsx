"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import ServiceForm, { type ServiceFormData } from '@/components/ServiceForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { createServiceListing } from '@/services/serviceListingService';
import type { ServiceCategory, AvailabilityType } from '@/types/content';

/** Returns true if the current time is Thursday in the UK (Europe/London). */
function isThursdayUK(): boolean {
  return new Date().toLocaleDateString('en-GB', {
    timeZone: 'Europe/London',
    weekday: 'long',
  }) === 'Thursday';
}

export default function CreateServicePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

  const isElevated = profile?.role === 'admin' || profile?.role === 'moderator' || profile?.role === 'contributor';
  const postingBlocked = !isThursdayUK() && !isElevated;

  const handleSubmit = async (data: ServiceFormData) => {
    if (!user) return;

    await createServiceListing({
      businessName: data.businessName,
      category: data.category as ServiceCategory,
      subcategory: data.subcategory,
      description: data.description,
      serviceAreas: data.serviceAreas,
      whatsapp: data.whatsapp,
      phone: data.phone,
      availabilityType: data.availabilityType as AvailabilityType,
      expiresAt: data.expiresAt,
      authorId: user.uid,
    });

    setSuccess(true);
  };

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold text-slate-900 mb-1">List a Service</h1>
          <p className="text-sm text-slate-600 mb-6">Offer your skills or services to the Stevenage community.</p>

          {success ? (
            <StateMessage
              type="success"
              title="Service listed!"
              message="Your service listing is pending review and will be visible once approved."
              action={
                <div className="flex gap-2">
                  <button
                    onClick={() => setSuccess(false)}
                    className="text-sm font-medium text-emerald-700 underline"
                  >
                    List another
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
            <>
              {postingBlocked && (
                <div
                  className="rounded-xl p-4 flex gap-3 mb-6"
                  style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}
                >
                  <div
                    className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm"
                    style={{ background: '#FEF3C7', color: '#D97706' }}
                  >
                    📅
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: '#92400E' }}>
                      New listings open on Thursdays only
                    </p>
                    <p className="mt-0.5 text-xs leading-relaxed" style={{ color: '#B45309' }}>
                      To keep the community marketplace organised, new service and product listings
                      can only be submitted on Thursdays. You can browse the form and prepare your
                      details now — the submit button will be enabled again on Thursday.
                    </p>
                  </div>
                </div>
              )}

              <fieldset disabled={postingBlocked} className="contents">
                <ServiceForm
                  defaultValues={{
                    businessName: profile?.displayName ?? '',
                    whatsapp: profile?.phone ?? '',
                    phone: profile?.phone ?? '',
                    serviceAreas: profile?.area ? [profile.area] : [],
                  }}
                  onSubmit={handleSubmit}
                />
              </fieldset>
            </>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
