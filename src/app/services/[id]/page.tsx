"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import StateMessage from '@/components/StateMessage';
import { getServiceById } from '@/services/browseService';
import type { ServiceListing } from '@/types/content';
import ImageCarousel from '@/components/ImageCarousel';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [service, setService] = useState<ServiceListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!params.id || typeof params.id !== 'string') return;
    getServiceById(params.id)
      .then((s) => {
        if (!s || s.status !== 'approved') {
          setNotFound(true);
        } else {
          setService(s);
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [params.id]);

  const whatsappLink = service
    ? `https://wa.me/${service.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(
        `Hi! I found your service "${service.businessName}" on NIS Hub and I'm interested.`
      )}`
    : '';

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto">
          {loading && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 animate-pulse">
              <div className="h-7 w-2/3 bg-slate-200 rounded mb-3" />
              <div className="h-4 w-1/3 bg-slate-100 rounded mb-4" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-2" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          )}

          {notFound && (
            <StateMessage
              type="empty"
              title="Service not found"
              message="This listing may have been removed or is not yet approved."
              action={
                <button onClick={() => router.push('/services')} className="text-sm font-medium text-blue-600 underline">
                  Back to services
                </button>
              }
            />
          )}

          {service && (
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
              {/* Header */}
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6">
                <h1 className="text-2xl font-bold mb-1">{service.businessName}</h1>
                <p className="text-blue-100 text-sm">
                  {service.category}{service.subcategory ? ` / ${service.subcategory}` : ''}
                </p>
              </div>

              {/* Image carousel — only rendered when the listing has photos */}
              {(service.imageUrls?.length ?? 0) > 0 && (
                <ImageCarousel
                  imageUrls={service.imageUrls!}
                  alt={service.businessName}
                  heightClass="h-64"
                  fit="contain"
                />
              )}

              <div className="p-6 space-y-5">
                {/* Description */}
                <div>
                  <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-2">About</h2>
                  <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{service.description}</p>
                </div>

                {/* Details grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Service Areas</h3>
                    <div className="flex flex-wrap gap-1">
                      {service.serviceAreas.map((area) => (
                        <span key={area} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700">
                          {area}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-slate-500 mb-1">Availability</h3>
                    <p className="text-slate-700 capitalize">{service.availabilityType}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="pt-4 border-t space-y-2">
                  {service.whatsapp && (
                    <a
                      href={whatsappLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-lg bg-green-600 px-4 py-3 text-sm font-semibold text-white hover:bg-green-700 transition-colors min-h-[44px]"
                    >
                      Contact via WhatsApp
                    </a>
                  )}
                  {service.phone && (
                    <a
                      href={`tel:${service.phone}`}
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                    >
                      Call {service.phone}
                    </a>
                  )}
                  {service.linkUrl && (
                    <a
                      href={service.linkUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full rounded-lg border border-slate-300 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors min-h-[44px]"
                    >
                      Visit website ↗
                    </a>
                  )}
                </div>

                <button
                  onClick={() => router.push('/services')}
                  className="text-sm text-slate-500 hover:text-slate-700"
                >
                  &larr; Back to services
                </button>
              </div>
            </div>
          )}
        </div>
      </AppShell>
    </AuthGuard>
  );
}
