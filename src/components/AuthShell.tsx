"use client";

/**
 * AuthShell
 * ---------
 * Shared 2-panel layout for all auth pages (sign-in, sign-up, forgot-password).
 *
 * Mobile:  stacked — compact green strip (eyebrow + H1 + tagline) then form card
 * Desktop: 2-column grid — full welcome panel left, form card right
 *
 * children = the form card content (headings, fields, submit button, links)
 *
 * No auth logic lives here. This is purely presentation.
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

export default function AuthShell({ children }: { children: ReactNode }) {
  return (
    <div
      className="min-h-screen grid grid-cols-1 lg:grid-cols-2"
      style={{ background: 'var(--color-bg)' }}
    >
      {/* ── Left / top: Welcome panel ──────────────────────────── */}
      <div
        className="relative flex flex-col justify-center overflow-hidden px-6 py-8 lg:px-12 lg:py-16"
        style={{
          background: 'linear-gradient(135deg, #0B3D2E 0%, #008753 100%)',
        }}
      >
        {/* Decorative rings */}
        <div
          className="pointer-events-none absolute -top-16 -right-16 w-64 h-64 rounded-full opacity-10"
          style={{ border: '40px solid #fff' }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none hidden lg:block absolute -bottom-20 -left-20 w-72 h-72 rounded-full opacity-10"
          style={{ border: '40px solid #fff' }}
          aria-hidden="true"
        />

        {/* ── Always visible: eyebrow + H1 + tagline ─── */}
        <p
          className="text-xs font-bold uppercase tracking-widest mb-2"
          style={{ color: '#6EE7B7' }}
        >
          NIS Hub
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold leading-tight text-white">
          Welcome to NIS Hub
        </h1>
        <p className="mt-1.5 text-sm" style={{ color: '#A7F3D0' }}>
          A digital home for Nigerians in Stevenage.
        </p>

        {/* ── Desktop only: extended copy, bullets, rules link ─── */}
        <div className="hidden lg:block mt-6 space-y-4">
          <p className="text-sm leading-relaxed" style={{ color: '#A7F3D0' }}>
            Find local services, share opportunities, discover events, and stay
            connected beyond WhatsApp.
          </p>
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
            No more weekly reposting. Your listings stay visible and easier to find.
          </p>

          <ul className="space-y-2">
            {[
              'Services and products stay visible',
              'Requests, events, and notices each have their own place',
              'Built to help the community connect in real life',
            ].map((point) => (
              <li key={point} className="flex items-start gap-2">
                <span
                  className="flex-shrink-0 mt-0.5 w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                  style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
                >
                  ✓
                </span>
                <span className="text-sm" style={{ color: '#A7F3D0' }}>{point}</span>
              </li>
            ))}
          </ul>

          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
            🛡️ Moderated by community admins to keep things safe and useful.
          </p>

          <Link
            href="/rules"
            className="inline-block text-xs font-medium underline hover:no-underline"
            style={{ color: '#6EE7B7' }}
          >
            Read the community guidelines →
          </Link>
        </div>
      </div>

      {/* ── Right / bottom: Form panel ─────────────────────────── */}
      <div
        className="flex flex-col items-center justify-center px-4 py-8 lg:px-12"
        style={{ background: 'var(--color-bg)' }}
      >
        {/* Form card */}
        <div
          className="w-full max-w-sm rounded-2xl p-6 sm:p-8"
          style={{
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
            boxShadow: 'var(--shadow-card)',
          }}
        >
          {children}
        </div>

        {/* Mobile only: community guidelines link below the card */}
        <p className="lg:hidden mt-4 text-xs text-center" style={{ color: 'var(--color-muted)' }}>
          <Link
            href="/rules"
            className="font-medium underline hover:no-underline"
            style={{ color: 'var(--color-primary)' }}
          >
            Community guidelines
          </Link>
          {' '}— the rules that keep this space safe and useful.
        </p>
      </div>
    </div>
  );
}
