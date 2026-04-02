import { ReactNode } from 'react';

interface CardProps {
  title?: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
  action?: ReactNode;
}

export default function Card({ title, subtitle, children, className = '', action }: CardProps) {
  return (
    <div
      className={`rounded-2xl bg-white p-4 sm:p-5 ${className}`}
      style={{ border: '1px solid var(--color-border)', boxShadow: 'var(--shadow-card)' }}
    >
      {(title || subtitle || action) && (
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            {title && (
              <h3 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>{title}</h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm" style={{ color: 'var(--color-muted)' }}>{subtitle}</p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="text-sm" style={{ color: 'var(--color-muted)' }}>{children}</div>
    </div>
  );
}
