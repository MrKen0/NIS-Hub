import { ReactNode } from 'react';

interface ButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
}

const variantStyles: Record<NonNullable<ButtonProps['variant']>, React.CSSProperties> = {
  primary: {
    background: 'var(--color-primary)',
    color: '#fff',
  },
  secondary: {
    background: 'transparent',
    color: 'var(--color-primary)',
    border: '1.5px solid var(--color-primary)',
  },
  ghost: {
    background: 'transparent',
    color: 'var(--color-text)',
    border: '1.5px solid var(--color-border)',
  },
};

const variantHover: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'hover:opacity-90',
  secondary: 'hover:bg-[#E8F5EE]',
  ghost:     'hover:bg-slate-50',
};

const sizeClasses: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'py-2 px-4 text-sm',
  md: 'py-2.5 px-5 text-sm',
  lg: 'py-3.5 px-6 text-base',
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
  disabled = false,
}: ButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={variantStyles[variant]}
      className={`
        inline-flex min-h-[44px] items-center justify-center rounded-xl font-semibold
        transition-all
        ${variantHover[variant]}
        ${sizeClasses[size]}
        ${className}
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50
      `}
      onMouseEnter={(e) => {
        if (variant === 'primary' && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary-dark)';
        }
      }}
      onMouseLeave={(e) => {
        if (variant === 'primary' && !disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'var(--color-primary)';
        }
      }}
    >
      {children}
    </button>
  );
}
