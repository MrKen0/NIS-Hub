interface Props {
  status: string;
}

const statusStyle: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  paused: 'bg-orange-100 text-orange-800',
  archived: 'bg-slate-100 text-slate-600',
};

export default function StatusChip({ status }: Props) {
  return (
    <span
      data-testid="status-chip"
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle[status] ?? 'bg-slate-100 text-slate-600'}`}
    >
      {status.toUpperCase()}
    </span>
  );
}
