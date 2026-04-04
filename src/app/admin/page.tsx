"use client";

import { useEffect, useState } from 'react';
import AppShell from '@/components/AppShell';
import AdminGuard from '@/components/AdminGuard';
import AdminTabBar from '@/components/admin/AdminTabBar';
import type { AdminTab } from '@/components/admin/AdminTabBar';
import AdminServicePanel from '@/components/admin/AdminServicePanel';
import AdminProductPanel from '@/components/admin/AdminProductPanel';
import AdminEventPanel from '@/components/admin/AdminEventPanel';
import AdminNoticePanel from '@/components/admin/AdminNoticePanel';
import AdminRequestPanel from '@/components/admin/AdminRequestPanel';
import AdminMemberPanel from '@/components/admin/AdminMemberPanel';
import AdminHistoryPanel from '@/components/admin/AdminHistoryPanel';
import { getPendingCounts } from '@/services/moderationService';

const EMPTY_COUNTS: Record<AdminTab, number> = {
  services: 0,
  products: 0,
  events: 0,
  notices: 0,
  requests: 0,
  members: 0,
  history: 0,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('members');
  const [pendingCounts, setPendingCounts] = useState(EMPTY_COUNTS);

  // Fetch badge counts on mount and whenever the active tab changes.
  // Also called by panels via onActionComplete after any moderation action,
  // so the badge updates immediately without requiring a tab switch.
  function refreshCounts() {
    getPendingCounts()
      .then(setPendingCounts)
      .catch(() => {});
  }

  useEffect(() => {
    refreshCounts();
  }, [activeTab]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AdminGuard>
      <AppShell>
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-5">
            <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
            <p className="text-sm text-slate-600">Review and moderate community content</p>
          </div>

          {/* Tabs */}
          <div className="mb-5">
            <AdminTabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              pendingCounts={pendingCounts}
            />
          </div>

          {/* Active panel — each receives onActionComplete to refresh badge counts */}
          {activeTab === 'services' && <AdminServicePanel onActionComplete={refreshCounts} />}
          {activeTab === 'products' && <AdminProductPanel onActionComplete={refreshCounts} />}
          {activeTab === 'events' && <AdminEventPanel onActionComplete={refreshCounts} />}
          {activeTab === 'notices' && <AdminNoticePanel onActionComplete={refreshCounts} />}
          {activeTab === 'requests' && <AdminRequestPanel onActionComplete={refreshCounts} />}
          {activeTab === 'members' && <AdminMemberPanel onActionComplete={refreshCounts} />}
          {activeTab === 'history' && <AdminHistoryPanel />}
        </div>
      </AppShell>
    </AdminGuard>
  );
}
