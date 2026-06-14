'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', loading, disabled, children, ...props }, ref) => {
    const variants = {
      primary: 'bg-brand-500 hover:bg-brand-600 text-white shadow-lg shadow-brand-500/20',
      secondary: 'bg-bg-tertiary hover:bg-bg-hover text-text-primary border border-border-default',
      ghost: 'hover:bg-bg-tertiary text-text-secondary hover:text-text-primary',
      danger: 'bg-error/10 hover:bg-error/20 text-error border border-error/20',
      outline: 'border border-brand-500 text-brand-400 hover:bg-brand-500/10',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-xs rounded-lg',
      md: 'px-4 py-2 text-sm rounded-xl',
      lg: 'px-6 py-3 text-base rounded-xl',
      icon: 'p-2 rounded-xl',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 disabled:opacity-40 disabled:cursor-not-allowed select-none',
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
