"use client";

import Link from 'next/link';
import AuthGuard from '@/components/AuthGuard';
import AppShell from '@/components/AppShell';

/**
 * Community Guidelines page.
 *
 * Layout note: AuthGuard + AppShell are used for structural consistency
 * with all other pages. The page content itself has no dependency on
 * signed-in state — it can be made publicly accessible in a future
 * iteration without any layout redesign.
 */

const GUIDELINES = [
  {
    number: '1',
    icon: '🎯',
    title: 'Purpose',
    content:
      'NIS Hub exists to connect Nigerians living in Stevenage. Use it to share services, sell products, discover events, and stay informed. Keep all activity relevant to the local community.',
  },
  {
    number: '2',
    icon: '🤝',
    title: 'Behaviour',
    content:
      'Treat every member with respect. Harassment, hate speech, intimidation, and discrimination of any kind are not tolerated and will result in immediate removal from the community.',
  },
  {
    number: '3',
    icon: '📝',
    title: 'Posting rules',
    content:
      'No spam, no off-topic content, and no unsolicited advertising. Posts must relate to the Stevenage Nigerian community. Duplicate or low-quality posts will be removed without notice.',
  },
  {
    number: '4',
    icon: '🛍️',
    title: 'Business posts',
    content:
      'Self-promotion for services or products belongs in your NIS Hub listing — not repeated messages. If you share in the WhatsApp group, Thursday is the designated day for business promotion. Use the hub to keep your listings always visible.',
  },
  {
    number: '5',
    icon: '🔒',
    title: 'Privacy',
    content:
      "Do not share another member's personal details — phone number, address, or photos — without their explicit consent. Respect the privacy of every person in this community.",
  },
  {
    number: '6',
    icon: '🛡️',
    title: 'Admin authority',
    content:
      'Admins may remove content or suspend members at their discretion to maintain a safe and useful environment. Decisions may be made without prior notice to preserve community integrity.',
  },
];

export default function RulesPage() {
  return (
    <AuthGuard>
      <AppShell>
        <div className="max-w-2xl mx-auto pb-8">

          {/* ── Hero ─────────────────────────────────────── */}
          <section
            className="rounded-2xl p-6 mb-6"
            style={{
              background: 'linear-gradient(135deg, var(--color-primary-surface) 0%, #d4ede1 100%)',
              border: '1px solid rgba(0,135,83,0.18)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-widest mb-2"
              style={{ color: 'var(--color-primary)' }}
            >
              NIS Hub
            </p>
            <h1 className="text-2xl font-bold" style={{ color: 'var(--color-primary-dark)' }}>
              Community Guidelines
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--color-primary-dark)', opacity: 0.8 }}>
              The rules that keep this space safe, respectful, and useful for everyone.
            </p>
          </section>

          {/* ── Guideline sections ───────────────────────── */}
          <div className="space-y-3">
            {GUIDELINES.map((g) => (
              <section
                key={g.number}
                className="rounded-xl p-4"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  border: '1px solid var(--color-border)',
                  borderLeftWidth: '3px',
                  borderLeftColor: 'var(--color-primary)',
                  boxShadow: 'var(--shadow-card)',
                }}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-base"
                    style={{ backgroundColor: 'var(--color-primary-surface)' }}
                  >
                    {g.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className="text-xs font-bold"
                        style={{ color: 'var(--color-primary)', opacity: 0.7 }}
                      >
                        {g.number}.
                      </span>
                      <h2 className="font-bold text-slate-900">{g.title}</h2>
                    </div>
                    <p className="text-sm text-slate-600 leading-relaxed">{g.content}</p>
                  </div>
                </div>
              </section>
            ))}
          </div>

          {/* ── Footer note ──────────────────────────────── */}
          <p className="mt-6 text-center text-xs text-slate-500 leading-relaxed px-4">
            By using NIS Hub, you agree to these community guidelines.
          </p>

          {/* ── Back link ────────────────────────────────── */}
          <div className="mt-4 text-center">
            <Link
              href="/"
              className="text-sm font-medium"
              style={{ color: 'var(--color-primary)' }}
            >
              ← Back to Home
            </Link>
          </div>

        </div>
      </AppShell>
    </AuthGuard>
  );
}
