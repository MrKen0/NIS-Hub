"use client";

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import AdminContentCard from './AdminContentCard';
import AdminBulkActionBar from './AdminBulkActionBar';
import ModerationConfirmDialog from './ModerationConfirmDialog';
import StatusFilterBar from './StatusFilterBar';
import type { ContentStatus, CommunityNotice } from '@/types/content';
import { getNoticesForReview, moderateContent } from '@/services/moderationService';

interface Props { onActionComplete?: () => void; }

export default function AdminNoticePanel({ onActionComplete }: Props) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<CommunityNotice[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | undefined>('pending');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Single-item confirmation dialog
  const [dialog, setDialog] = useState<{
    docId: string; currentStatus: string; action: ContentStatus; title: string;
  } | null>(null);

  // Bulk action state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDialog, setBulkDialog] = useState<{ action: ContentStatus; count: number } | null>(null);
  const [bulkPending, setBulkPending] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    setError('');
    getNoticesForReview(statusFilter)
      .then(setItems)
      .catch(() => setError('Failed to load notices.'))
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(); }, [load]);

  // Clear selection whenever the filter changes
  useEffect(() => {
    setSelectedIds(new Set());
    setSuccess('');
  }, [statusFilter]);

  async function handleAction(docId: string, currentStatus: string, newStatus: ContentStatus, reason?: string) {
    if (!user || !profile) return;
    try {
      await moderateContent({
        collectionName: 'notices',
        docId,
        newStatus,
        previousValue: currentStatus,
        targetType: 'notice',
        moderatorId: user.uid,
        moderatorName: profile.displayName,
        reason,
      });
      load();
      onActionComplete?.();
    } catch {
      setError('Failed to update status.');
    }
  }

  async function handleBulkAction(action: ContentStatus, reason?: string) {
    if (!user || !profile || selectedIds.size === 0) return;
    setBulkPending(true);
    setError('');
    setSuccess('');
    const ids = Array.from(selectedIds);
    const results = await Promise.allSettled(
      ids.map((docId) => {
        const item = items.find((i) => i.id === docId);
        return moderateContent({
          collectionName: 'notices',
          docId,
          newStatus: action,
          previousValue: item?.status ?? '',
          targetType: 'notice',
          moderatorId: user.uid,
          moderatorName: profile.displayName,
          reason,
        });
      })
    );
    const succeeded = results.filter((r) => r.status === 'fulfilled').length;
    const failed = results.filter((r) => r.status === 'rejected').length;
    setSelectedIds(new Set());
    setBulkPending(false);
    if (failed > 0) {
      setError(`${succeeded} updated, ${failed} failed.`);
    } else {
      setSuccess(`${succeeded} item${succeeded !== 1 ? 's' : ''} updated.`);
    }
    load();
    onActionComplete?.();
  }

  function openDialog(docId: string, currentStatus: string, action: ContentStatus) {
    const labels: Record<string, string> = { rejected: 'Reject', paused: 'Pause', archived: 'Archive' };
    setDialog({ docId, currentStatus, action, title: labels[action] ?? action });
  }

  const allSelected = items.length > 0 && selectedIds.size === items.length;

  function toggleSelectAll() {
    setSelectedIds(allSelected ? new Set() : new Set(items.map((i) => i.id)));
  }

  return (
    <div>
      <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}
      {success && <p className="text-sm text-green-600 mb-3">{success}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-full bg-slate-100 rounded mb-1" />
              <div className="h-4 w-3/4 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No notices match this filter.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <>
          {/* Select-all row */}
          <div className="flex items-center justify-between mb-2 px-1">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-slate-600 select-none">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleSelectAll}
                className="w-4 h-4 rounded accent-emerald-600"
              />
              {allSelected ? 'Deselect all' : `Select all (${items.length})`}
            </label>
            {selectedIds.size > 0 && (
              <span className="text-sm text-slate-500">
                {selectedIds.size} selected
                <button
                  onClick={() => setSelectedIds(new Set())}
                  className="ml-2 text-slate-400 hover:text-slate-600 font-bold"
                  aria-label="Clear selection"
                >×</button>
              </span>
            )}
          </div>

          {/* Bulk action bar */}
          <AdminBulkActionBar
            selectedCount={selectedIds.size}
            statusFilter={statusFilter}
            onBulkAction={(action) => setBulkDialog({ action, count: selectedIds.size })}
            onClearSelection={() => setSelectedIds(new Set())}
            disabled={bulkPending}
          />

          <div className="space-y-3">
            {items.map((item) => (
              <AdminContentCard
                key={item.id}
                title={item.title}
                subtitle={item.category}
                status={item.status}
                createdAt={item.createdAt}
                bodyPreview={item.body}
                selected={selectedIds.has(item.id)}
                onSelect={(checked) => {
                  setSelectedIds((prev) => {
                    const next = new Set(prev);
                    if (checked) next.add(item.id); else next.delete(item.id);
                    return next;
                  });
                }}
                details={[
                  { label: 'Category', value: item.category },
                  { label: 'Expires', value: item.expiresAt ? new Date(item.expiresAt).toLocaleDateString('en-GB') : '—' },
                ]}
                onApprove={() => handleAction(item.id, item.status, 'approved')}
                onReject={() => openDialog(item.id, item.status, 'rejected')}
                onPause={() => openDialog(item.id, item.status, 'paused')}
                onArchive={() => openDialog(item.id, item.status, 'archived')}
              />
            ))}
          </div>
        </>
      )}

      {/* Single-item confirmation dialog */}
      {dialog && (
        <ModerationConfirmDialog
          open
          title={`${dialog.title} this notice?`}
          description="This will change the notice's visibility to community members."
          confirmLabel={dialog.title}
          confirmColor={dialog.action === 'rejected' ? 'red' : dialog.action === 'paused' ? 'orange' : 'slate'}
          onConfirm={(reason) => {
            handleAction(dialog.docId, dialog.currentStatus, dialog.action, reason);
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}

      {/* Bulk confirmation dialog */}
      {bulkDialog && (
        <ModerationConfirmDialog
          open
          title={`${bulkDialog.action === 'approved' ? 'Approve' : bulkDialog.action === 'rejected' ? 'Reject' : bulkDialog.action === 'paused' ? 'Pause' : 'Archive'} ${bulkDialog.count} item${bulkDialog.count !== 1 ? 's' : ''}?`}
          description={`This will update all ${bulkDialog.count} selected item${bulkDialog.count !== 1 ? 's' : ''}. This cannot be undone.`}
          confirmLabel={bulkDialog.action === 'approved' ? 'Approve' : bulkDialog.action === 'rejected' ? 'Reject' : bulkDialog.action === 'paused' ? 'Pause' : 'Archive'}
          confirmColor={bulkDialog.action === 'rejected' ? 'red' : bulkDialog.action === 'paused' ? 'orange' : 'slate'}
          onConfirm={(reason) => {
            handleBulkAction(bulkDialog.action, reason);
            setBulkDialog(null);
          }}
          onCancel={() => setBulkDialog(null)}
        />
      )}
    </div>
  );
}
