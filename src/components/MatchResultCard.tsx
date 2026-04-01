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
  const hasPhone    = !!service.phone;

  return (
    <div
      data-testid="match-card"
      className="rounded-2xl bg-white p-5 sm:p-6"
      style={{
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-start gap-3 min-w-0">
          {/* Rank badge */}
          <span
            className="flex-shrink-0 inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold text-white mt-0.5"
            style={{ background: 'var(--color-primary)' }}
          >
            {rank}
          </span>
          <div className="min-w-0">
            <h3 className="font-bold text-[#1F2937] leading-snug line-clamp-1">
              {service.businessName}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-muted)' }}>
              {service.category}
              {service.subcategory && service.subcategory !== 'Other'
                ? ` · ${service.subcategory}`
                : ''}
            </p>
          </div>
        </div>

        {/* Score badge */}
        <span
          className="flex-shrink-0 rounded-full px-2.5 py-1 text-xs font-bold"
          style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
        >
          {score.total}/100
        </span>
      </div>

      {/* Description */}
      {service.description && (
        <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
          {service.description}
        </p>
      )}

      {/* Details chips */}
      <div className="flex flex-wrap gap-2 mb-4">
        {service.serviceAreas.slice(0, 3).map((a) => (
          <span
            key={a}
            className="rounded-full px-2.5 py-1 text-xs font-medium"
            style={{ background: '#F3F4F6', color: '#374151' }}
          >
            {a}
          </span>
        ))}
        {service.serviceAreas.length > 3 && (
          <span className="text-xs py-1" style={{ color: 'var(--color-muted)' }}>
            +{service.serviceAreas.length - 3} more
          </span>
        )}
        <span
          className="rounded-full px-2.5 py-1 text-xs font-medium capitalize ml-auto"
          style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
        >
          {service.availabilityType}
        </span>
      </div>

      {/* Why this matched */}
      <div
        data-testid="match-explanation"
        className="rounded-xl p-3.5 mb-4"
        style={{ background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--color-muted)' }}>
          Why this matched
        </p>
        <ul className="space-y-1">
          {explanation.map((reason, i) => (
            <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
              <span
                className="flex-shrink-0 mt-0.5 font-bold"
                style={{ color: 'var(--color-primary)' }}
                aria-hidden="true"
              >
                ✓
              </span>
              {reason}
            </li>
          ))}
        </ul>
      </div>

      {/* Contact buttons */}
      <div
        className="flex gap-2 pt-4"
        style={{ borderTop: '1px solid var(--color-border)' }}
      >
        {hasWhatsApp && (
          <a
            href={formatWhatsAppUrl(service.whatsapp, service.businessName)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition min-h-[44px]"
            style={
              preferredContact !== 'phone'
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: '#F3F4F6', color: '#374151' }
            }
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </a>
        )}
        {hasPhone && (
          <a
            href={formatPhoneUrl(service.phone)}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition min-h-[44px]"
            style={
              preferredContact === 'phone'
                ? { background: 'var(--color-primary)', color: '#fff' }
                : { background: '#F3F4F6', color: '#374151' }
            }
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.68A2 2 0 012 .18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z" />
            </svg>
            Call
          </a>
        )}
        {!hasWhatsApp && !hasPhone && (
          <p className="text-sm" style={{ color: 'var(--color-muted)' }}>No contact details available</p>
        )}
      </div>
    </div>
  );
}
