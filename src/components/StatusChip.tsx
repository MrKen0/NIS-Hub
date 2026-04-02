interface Props {
  status: string;
}

const statusConfig: Record<string, { dot: string; bg: string; text: string; label: string }> = {
  pending:  { dot: '#F59E0B', bg: '#FFFBEB', text: '#92400E', label: 'Pending' },
  approved: { dot: '#10B981', bg: 'var(--color-primary-surface)', text: 'var(--color-primary-dark)', label: 'Approved' },
  rejected: { dot: '#EF4444', bg: '#FEF2F2', text: '#991B1B', label: 'Rejected' },
  paused:   { dot: '#F97316', bg: '#FFF7ED', text: '#9A3412', label: 'Paused' },
  archived: { dot: '#9CA3AF', bg: '#F9FAFB', text: '#6B7280', label: 'Archived' },
  active:   { dot: '#10B981', bg: 'var(--color-primary-surface)', text: 'var(--color-primary-dark)', label: 'Active' },
};

export default function StatusChip({ status }: Props) {
  const cfg = statusConfig[status] ?? { dot: '#9CA3AF', bg: '#F9FAFB', text: '#6B7280', label: status };
  return (
    <span
      data-testid="status-chip"
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: cfg.bg, color: cfg.text }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  );
}
