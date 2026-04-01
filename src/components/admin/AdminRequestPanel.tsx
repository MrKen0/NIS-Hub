"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import AdminContentCard from './AdminContentCard';
import ModerationConfirmDialog from './ModerationConfirmDialog';
import StatusFilterBar from './StatusFilterBar';
import type { ContentStatus, HelpRequest } from '@/types/content';
import { subscribeToRequestsForReview, moderateContent } from '@/services/moderationService';

interface Props { onActionComplete?: () => void; }

export default function AdminRequestPanel({ onActionComplete }: Props) {
  const { user, profile } = useAuth();
  const [items, setItems] = useState<HelpRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<ContentStatus | undefined>('pending');
  const [error, setError] = useState('');
  const [dialog, setDialog] = useState<{
    docId: string; currentStatus: string; action: ContentStatus; title: string;
  } | null>(null);

  // Real-time listener — auto-updates on remote changes; cleans up on unmount or filter change
  useEffect(() => {
    setLoading(true);
    setError('');
    const unsub = subscribeToRequestsForReview(
      statusFilter,
      (data) => { setItems(data); setLoading(false); },
      () => { setError('Failed to load requests.'); setLoading(false); },
    );
    return unsub;
  }, [statusFilter]);

  async function handleAction(docId: string, currentStatus: string, newStatus: ContentStatus, reason?: string) {
    if (!user || !profile) return;
    try {
      await moderateContent({
        collectionName: 'requests',
        docId,
        newStatus,
        previousValue: currentStatus,
        targetType: 'request',
        moderatorId: user.uid,
        moderatorName: profile.displayName,
        reason,
      });
      onActionComplete?.();
    } catch {
      setError('Failed to update status.');
    }
  }

  function openDialog(docId: string, currentStatus: string, action: ContentStatus) {
    const labels: Record<string, string> = { rejected: 'Reject', paused: 'Pause', archived: 'Archive' };
    setDialog({ docId, currentStatus, action, title: labels[action] ?? action });
  }

  return (
    <div>
      <StatusFilterBar value={statusFilter} onChange={setStatusFilter} />
      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

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
          <p className="text-slate-500">No requests match this filter.</p>
        </div>
      )}

      {!loading && items.length > 0 && (
        <div className="space-y-3">
          {items.map((item) => (
            <AdminContentCard
              key={item.id}
              title={item.text.length > 60 ? item.text.slice(0, 60) + '...' : item.text}
              subtitle={item.category ?? 'Uncategorised'}
              status={item.status}
              createdAt={item.createdAt}
              bodyPreview={item.text}
              details={[
                { label: 'Urgency', value: item.urgency },
                { label: 'Location', value: item.location || '—' },
                { label: 'Contact', value: item.preferredContact },
                { label: 'WhatsApp', value: item.whatsapp || '—' },
              ]}
              onApprove={() => handleAction(item.id, item.status, 'approved')}
              onReject={() => openDialog(item.id, item.status, 'rejected')}
              onPause={() => openDialog(item.id, item.status, 'paused')}
              onArchive={() => openDialog(item.id, item.status, 'archived')}
            />
          ))}
        </div>
      )}

      {dialog && (
        <ModerationConfirmDialog
          open
          title={`${dialog.title} this help request?`}
          description="This will change the request's visibility to community members."
          confirmLabel={dialog.title}
          confirmColor={dialog.action === 'rejected' ? 'red' : dialog.action === 'paused' ? 'orange' : 'slate'}
          onConfirm={(reason) => {
            handleAction(dialog.docId, dialog.currentStatus, dialog.action, reason);
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
