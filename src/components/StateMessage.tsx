import { ReactNode } from 'react';

interface StateMessageProps {
  type?: 'empty' | 'loading' | 'error' | 'success';
  title: string;
  message: string;
  action?: ReactNode;
}

const stateStyles = {
  empty: 'border-slate-200 bg-slate-50 text-slate-600',
  loading: 'border-blue-200 bg-blue-50 text-blue-700',
  error: 'border-red-200 bg-red-50 text-red-700',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
};

export default function StateMessage({ type = 'empty', title, message, action }: StateMessageProps) {
  return (
    <div className={`rounded-xl border p-4 ${stateStyles[type]}`} role="status" aria-live="polite">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
