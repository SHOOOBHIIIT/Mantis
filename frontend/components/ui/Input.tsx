'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-text-secondary font-medium">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            className={cn(
              'w-full bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200',
              'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
              'disabled:opacity-40 disabled:cursor-not-allowed',
              icon && 'pl-10',
              error && 'border-error focus:border-error focus:ring-error/20',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-xs text-error mt-0.5">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="text-sm text-text-secondary font-medium">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={cn(
            'w-full bg-bg-tertiary border border-border-default rounded-xl px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted transition-colors duration-200 resize-none',
            'focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20',
            'disabled:opacity-40 disabled:cursor-not-allowed',
            error && 'border-error',
            className
          )}
          {...props}
        />
        {error && <p className="text-xs text-error mt-0.5">{error}</p>}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
