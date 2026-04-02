"use client";

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';
import { useAuth } from '@/lib/auth/AuthContext';

const postTypes = [
  {
    title: 'Product',
    description: 'Sell food, goods, or crafts',
    href: '/create/product',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    requiresRole: null,
  },
  {
    title: 'Service',
    description: 'Offer your skills or services',
    href: '/create/service',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    requiresRole: null,
  },
  {
    title: 'Request',
    description: 'Ask the community for help',
    href: '/create/request',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    requiresRole: null,
  },
  {
    title: 'Event',
    description: 'Share a community event',
    href: '/create/event',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    requiresRole: null,
  },
  {
    title: 'Notice',
    description: 'Post a community announcement',
    href: '/create/notice',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
      </svg>
    ),
    requiresRole: 'contributor' as const,
  },
];

export default function CreateChooserPage() {
  const { profile } = useAuth();

  const isContributorOrAdmin = profile?.role === 'contributor' || profile?.role === 'admin';

  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>What would you like to post?</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--color-muted)' }}>Choose a type to get started.</p>

          <div className="space-y-3">
            {postTypes
              .filter((pt) => !pt.requiresRole || isContributorOrAdmin)
              .map((pt) => (
                <Link
                  key={pt.href}
                  href={pt.href}
                  className="flex items-center gap-4 rounded-xl bg-white p-4 card-lift"
                  style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
                >
                  <div className="flex-shrink-0" style={{ color: 'var(--color-primary)' }}>{pt.icon}</div>
                  <div>
                    <div className="font-semibold" style={{ color: 'var(--color-text)' }}>{pt.title}</div>
                    <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{pt.description}</div>
                  </div>
                  <svg className="ml-auto w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
          </div>
        </div>
      </AppShell>
    </AuthGuard>
  );
}
