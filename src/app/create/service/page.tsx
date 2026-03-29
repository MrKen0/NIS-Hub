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

export default function CreateServicePage() {
  const { user, profile } = useAuth();
  const router = useRouter();
  const [success, setSuccess] = useState(false);

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
            <ServiceForm
              defaultValues={{
                businessName: profile?.displayName ?? '',
                whatsapp: profile?.phone ?? '',
                phone: profile?.phone ?? '',
                serviceAreas: profile?.area ? [profile.area] : [],
              }}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
