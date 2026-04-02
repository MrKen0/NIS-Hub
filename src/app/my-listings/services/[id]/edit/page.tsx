"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import AuthGuard from '@/components/AuthGuard';
import ServiceForm, { type ServiceFormData } from '@/components/ServiceForm';
import StateMessage from '@/components/StateMessage';
import { useAuth } from '@/lib/auth/AuthContext';
import { getServiceById } from '@/services/browseService';
import { updateServiceListing } from '@/services/serviceListingService';
import type { ServiceListing, ServiceCategory, AvailabilityType } from '@/types/content';

export default function EditServicePage() {
  return (
    <AuthGuard>
      <AppShell>
        <EditServiceContent />
      </AppShell>
    </AuthGuard>
  );
}

function EditServiceContent() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === 'string' ? params.id : '';

  const [listing, setListing] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!id || !user) return;

    getServiceById(id)
      .then((svc) => {
        if (!svc || svc.authorId !== user.uid) {
          setNotFound(true);
        } else {
          setListing(svc);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [id, user]);

  const handleSubmit = async (data: ServiceFormData) => {
    if (!id) return;
    await updateServiceListing(id, {
      businessName:     data.businessName,
      category:         data.category as ServiceCategory,
      subcategory:      data.subcategory,
      description:      data.description,
      serviceAreas:     data.serviceAreas,
      whatsapp:         data.whatsapp,
      phone:            data.phone,
      availabilityType: data.availabilityType as AvailabilityType,
      expiresAt:        data.expiresAt,
    });
    setSuccess(true);
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 rounded-xl bg-slate-100 animate-pulse" />
        ))}
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-lg mx-auto">
        <StateMessage
          type="error"
          title="Not found"
          message="This listing doesn't exist or you don't have permission to edit it."
          action={
            <button
              onClick={() => router.push('/my-listings')}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to My Listings
            </button>
          }
        />
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-lg mx-auto">
        <StateMessage
          type="success"
          title="Changes saved"
          message="Your listing is back in review and will reappear in browse once approved."
          action={
            <button
              onClick={() => router.push('/my-listings')}
              className="text-sm font-semibold underline"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to My Listings
            </button>
          }
        />
      </div>
    );
  }

  if (!listing) return null;

  // Map ServiceListing → ServiceFormData for pre-fill
  const defaultValues: Partial<ServiceFormData> = {
    businessName:     listing.businessName,
    category:         listing.category,
    subcategory:      listing.subcategory,
    description:      listing.description,
    serviceAreas:     listing.serviceAreas,
    whatsapp:         listing.whatsapp,
    phone:            listing.phone,
    availabilityType: listing.availabilityType,
    expiresAt:        listing.expiresAt,
  };

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.push('/my-listings')}
          className="text-sm mb-4 inline-block"
          style={{ color: 'var(--color-muted)' }}
        >
          ← My Listings
        </button>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
          Edit Service
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>
          Saving will send this listing back for moderator review.
        </p>
      </div>

      <ServiceForm
        defaultValues={defaultValues}
        onSubmit={handleSubmit}
        submitLabel="Save changes"
      />
    </div>
  );
}
