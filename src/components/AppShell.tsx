'use client';

import { ReactNode } from 'react';
import TopNav from './TopNav';
import BottomNav from './BottomNav';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <TopNav />
      <main className="mx-auto max-w-6xl px-4 pb-28 pt-4 sm:px-6">{children}</main>
      <BottomNav />
    </div>
  );
}
