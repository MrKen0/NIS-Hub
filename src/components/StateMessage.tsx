import { ReactNode } from 'react';

interface StateMessageProps {
  type?: 'empty' | 'loading' | 'error' | 'success';
  title: string;
  message: string;
  action?: ReactNode;
}

function getStateStyle(type: string): React.CSSProperties {
  switch (type) {
    case 'loading':
      return {
        borderColor: 'var(--color-primary-surface-alt)',
        background: 'var(--color-primary-surface)',
        color: 'var(--color-primary)',
      };
    case 'error':
      return { borderColor: '#fca5a5', background: '#fef2f2', color: '#b91c1c' };
    case 'success':
      return { borderColor: '#6ee7b7', background: '#ecfdf5', color: '#047857' };
    default:
      return {
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-muted)',
      };
  }
}

export default function StateMessage({ type = 'empty', title, message, action }: StateMessageProps) {
  return (
    <div
      className="rounded-xl border p-4"
      style={getStateStyle(type)}
      role="status"
      aria-live="polite"
    >
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
