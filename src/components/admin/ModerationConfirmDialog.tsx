"use client";

import { useState } from 'react';

interface Props {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  confirmColor?: 'red' | 'orange' | 'slate';
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

const colorMap = {
  red: 'bg-red-600 hover:bg-red-700',
  orange: 'bg-orange-500 hover:bg-orange-600',
  slate: 'bg-slate-500 hover:bg-slate-600',
};

export default function ModerationConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  confirmColor = 'red',
  onConfirm,
  onCancel,
}: Props) {
  const [reason, setReason] = useState('');

  if (!open) return null;

  return (
    <div data-testid="confirm-dialog" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={onCancel}>
      <div
        className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-bold text-slate-900 mb-1">{title}</h2>
        <p className="text-sm text-slate-600 mb-4">{description}</p>

        <label className="block text-sm font-medium text-slate-700 mb-1">
          Reason (optional)
        </label>
        <textarea
          data-testid="reason-input"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Add a reason for this action..."
          rows={3}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none mb-4"
        />

        <div className="flex gap-3 justify-end">
          <button
            data-testid="dialog-cancel"
            onClick={onCancel}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition min-h-[44px]"
          >
            Cancel
          </button>
          <button
            data-testid="dialog-confirm"
            onClick={() => {
              onConfirm(reason.trim());
              setReason('');
            }}
            className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition min-h-[44px] ${colorMap[confirmColor]}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
