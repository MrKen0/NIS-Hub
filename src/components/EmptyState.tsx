import { ReactNode } from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export default function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div
      className="col-span-full rounded-xl border border-dashed p-6 text-center text-sm"
      style={{
        borderColor: 'var(--color-border)',
        background: 'var(--color-bg)',
        color: 'var(--color-muted)',
      }}
    >
      <div
        className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full text-2xl"
        style={{ background: 'var(--color-primary-surface)', color: 'var(--color-primary)' }}
      >
        {icon || 'ⓘ'}
      </div>
      <h3 className="text-base font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
      <p className="mt-2 text-sm" style={{ color: 'var(--color-muted)' }}>{description}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
