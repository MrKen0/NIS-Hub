"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth/AuthContext';
import StatusChip from '@/components/StatusChip';
import ModerationConfirmDialog from './ModerationConfirmDialog';
import { subscribeToUsersForReview, moderateUser } from '@/services/moderationService';
import type { UserProfile, UserStatus, UserRole } from '@/types/user';

const STATUS_FILTERS: { label: string; value: UserStatus | undefined }[] = [
  { label: 'All', value: undefined },
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Paused', value: 'paused' },
  { label: 'Archived', value: 'archived' },
];

const ROLES: UserRole[] = ['member', 'provider', 'contributor', 'admin'];

function fmtDate(d: Date) {
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

interface Props { onActionComplete?: () => void; }

export default function AdminMemberPanel({ onActionComplete }: Props) {
  const { user, profile } = useAuth();
  const [members, setMembers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<UserStatus | undefined>('pending');
  const [error, setError] = useState('');

  const [dialog, setDialog] = useState<{
    uid: string;
    fieldChanged: 'status' | 'role';
    previousValue: string;
    newValue: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    setLoading(true);
    setError('');
    const unsub = subscribeToUsersForReview(
      statusFilter,
      (data) => { setMembers(data); setLoading(false); },
      () => { setError('Failed to load members.'); setLoading(false); },
    );
    return unsub;
  }, [statusFilter]);

  async function handleAction(
    uid: string,
    fieldChanged: 'status' | 'role',
    previousValue: string,
    newValue: string,
    reason?: string,
  ) {
    if (!user || !profile) return;
    try {
      await moderateUser({
        uid,
        fieldChanged,
        previousValue,
        newValue,
        moderatorId: user.uid,
        moderatorName: profile.displayName,
        reason,
      });
      onActionComplete?.();
    } catch {
      setError('Failed to update member.');
    }
  }

  function openStatusDialog(uid: string, currentStatus: string, newStatus: string) {
    const labels: Record<string, string> = { approved: 'Approve', paused: 'Pause', archived: 'Archive' };
    setDialog({
      uid,
      fieldChanged: 'status',
      previousValue: currentStatus,
      newValue: newStatus,
      title: labels[newStatus] ?? newStatus,
    });
  }

  function openRoleDialog(uid: string, currentRole: string, newRole: string) {
    setDialog({
      uid,
      fieldChanged: 'role',
      previousValue: currentRole,
      newValue: newRole,
      title: `Change role to ${newRole}`,
    });
  }

  return (
    <div>
      {/* Status filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
        {STATUS_FILTERS.map((f) => {
          const active = statusFilter === f.value;
          return (
            <button
              key={f.label}
              onClick={() => setStatusFilter(f.value)}
              data-testid={`filter-${f.value ?? 'all'}`}
              className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition min-h-[32px] ${
                active ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {error && <p className="text-sm text-red-600 mb-3">{error}</p>}

      {loading && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="rounded-xl border border-slate-200 bg-white p-5 animate-pulse">
              <div className="h-5 w-2/3 bg-slate-200 rounded mb-2" />
              <div className="h-4 w-1/2 bg-slate-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {!loading && members.length === 0 && (
        <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
          <p className="text-slate-500">No members match this filter.</p>
        </div>
      )}

      {!loading && members.length > 0 && (
        <div className="space-y-3">
          {members.map((m) => (
            <div key={m.uid} data-testid="member-card" className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="min-w-0">
                  <h3 data-testid="member-name" className="font-semibold text-slate-900">{m.displayName}</h3>
                  <p className="text-sm text-slate-500 truncate">{m.email}</p>
                </div>
                <StatusChip status={m.status} />
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm mb-3">
                <div className="flex gap-1">
                  <span className="text-slate-400">Area:</span>
                  <span className="text-slate-700 font-medium">{m.area || '—'}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-slate-400">Role:</span>
                  <span className="text-slate-700 font-medium capitalize">{m.role}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-slate-400">Intended:</span>
                  <span className="text-slate-700 font-medium capitalize">{m.intendedUses.join(', ')}</span>
                </div>
                <div className="flex gap-1">
                  <span className="text-slate-400">Joined:</span>
                  <span className="text-slate-700 font-medium">{fmtDate(m.createdAt)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100">
                {/* Status actions */}
                {m.status === 'pending' && (
                  <button
                    data-testid="approve-btn"
                    onClick={() => handleAction(m.uid, 'status', m.status, 'approved')}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition min-h-[44px]"
                  >
                    Approve
                  </button>
                )}
                {(m.status === 'pending' || m.status === 'approved') && (
                  <button
                    data-testid="pause-btn"
                    onClick={() => openStatusDialog(m.uid, m.status, 'paused')}
                    className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition min-h-[44px]"
                  >
                    Pause
                  </button>
                )}
                {m.status === 'paused' && (
                  <button
                    data-testid="approve-btn"
                    onClick={() => handleAction(m.uid, 'status', m.status, 'approved')}
                    className="rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition min-h-[44px]"
                  >
                    Approve
                  </button>
                )}
                {m.status !== 'archived' && (
                  <button
                    data-testid="archive-btn"
                    onClick={() => openStatusDialog(m.uid, m.status, 'archived')}
                    className="rounded-lg bg-slate-500 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-600 transition min-h-[44px]"
                  >
                    Archive
                  </button>
                )}

                {/* Role selector — only for non-archived members, don't allow changing own role */}
                {m.status !== 'archived' && m.uid !== user?.uid && (
                  <select
                    value={m.role}
                    onChange={(e) => openRoleDialog(m.uid, m.role, e.target.value)}
                    className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 min-h-[44px] ml-auto"
                    aria-label={`Change role for ${m.displayName}`}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
                    ))}
                  </select>
                )}

                {m.status === 'archived' && (
                  <p className="text-xs text-slate-400">Archived — no actions available</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {dialog && (
        <ModerationConfirmDialog
          open
          title={`${dialog.title}?`}
          description={
            dialog.fieldChanged === 'role'
              ? `This will change the member's role from ${dialog.previousValue} to ${dialog.newValue}.`
              : `This will change the member's status to ${dialog.newValue}.`
          }
          confirmLabel="Confirm"
          confirmColor={dialog.newValue === 'archived' ? 'slate' : dialog.newValue === 'paused' ? 'orange' : 'slate'}
          onConfirm={(reason) => {
            handleAction(dialog.uid, dialog.fieldChanged, dialog.previousValue, dialog.newValue, reason);
            setDialog(null);
          }}
          onCancel={() => setDialog(null)}
        />
      )}
    </div>
  );
}
