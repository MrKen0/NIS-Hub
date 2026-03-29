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
import { getPendingCounts } from '@/services/moderationService';

const EMPTY_COUNTS: Record<AdminTab, number> = {
  services: 0,
  products: 0,
  events: 0,
  notices: 0,
  requests: 0,
  members: 0,
};

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<AdminTab>('services');
  const [pendingCounts, setPendingCounts] = useState(EMPTY_COUNTS);

  // Load pending counts on mount and when tab changes (to refresh after moderation actions)
  useEffect(() => {
    getPendingCounts()
      .then(setPendingCounts)
      .catch(() => {});
  }, [activeTab]);

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

          {/* Active panel */}
          {activeTab === 'services' && <AdminServicePanel />}
          {activeTab === 'products' && <AdminProductPanel />}
          {activeTab === 'events' && <AdminEventPanel />}
          {activeTab === 'notices' && <AdminNoticePanel />}
          {activeTab === 'requests' && <AdminRequestPanel />}
          {activeTab === 'members' && <AdminMemberPanel />}
        </div>
      </AppShell>
    </AdminGuard>
  );
}
