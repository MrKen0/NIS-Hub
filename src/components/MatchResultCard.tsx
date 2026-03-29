"use client";

import type { MatchResult } from '@/types/matching';
import type { PreferredContact } from '@/types/content';

interface Props {
  result: MatchResult;
  rank: number;
  preferredContact: PreferredContact;
}

function formatWhatsAppUrl(number: string, businessName: string): string {
  const cleaned = number.replace(/[^0-9+]/g, '');
  const text = encodeURIComponent(
    `Hi, I found ${businessName} on NIS Hub and would like to enquire about your services.`,
  );
  return `https://wa.me/${cleaned}?text=${text}`;
}

function formatPhoneUrl(number: string): string {
  return `tel:${number.replace(/[^0-9+]/g, '')}`;
}

export default function MatchResultCard({ result, rank, preferredContact }: Props) {
  const { service, score, explanation } = result;

  const hasWhatsApp = !!service.whatsapp;
  const hasPhone = !!service.phone;

  return (
    <div data-testid="match-card" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">
              {rank}
            </span>
            <h3 className="font-semibold text-slate-900 line-clamp-1">
              {service.businessName}
            </h3>
          </div>
          <p className="text-sm text-slate-500">
            {service.category}
            {service.subcategory && service.subcategory !== 'Other'
              ? ` \u2022 ${service.subcategory}`
              : ''}
          </p>
        </div>
        <span className="flex-shrink-0 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">
          {score.total}/100
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-3">
          {service.description}
        </p>
      )}

      {/* Details */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
        <div className="flex gap-1">
          <span className="text-slate-400">Areas:</span>
          <span className="text-slate-700 font-medium truncate">
            {service.serviceAreas.join(', ')}
          </span>
        </div>
        <div className="flex gap-1">
          <span className="text-slate-400">Availability:</span>
          <span className="text-slate-700 font-medium capitalize">
            {service.availabilityType}
          </span>
        </div>
      </div>

      {/* Why this matched */}
      <div data-testid="match-explanation" className="rounded-lg bg-slate-50 p-3 mb-3">
        <p className="text-xs font-semibold text-slate-500 mb-1">Why this matched</p>
        <ul className="space-y-0.5">
          {explanation.map((reason, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-1.5">
              <span className="text-green-500 mt-0.5 flex-shrink-0" aria-hidden="true">&check;</span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact buttons */}
      <div className="flex gap-2 pt-3 border-t border-slate-100">
        {hasWhatsApp && (
          <a
            href={formatWhatsAppUrl(service.whatsapp, service.businessName)}
            target="_blank"
            rel="noopener noreferrer"
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition min-h-[44px] ${
              preferredContact !== 'phone'
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            WhatsApp
          </a>
        )}
        {hasPhone && (
          <a
            href={formatPhoneUrl(service.phone)}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition min-h-[44px] ${
              preferredContact === 'phone'
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Call
          </a>
        )}
        {!hasWhatsApp && !hasPhone && (
          <p className="text-sm text-slate-400">No contact details available</p>
        )}
      </div>
    </div>
  );
}
