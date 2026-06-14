'use client';

import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className }: SpinnerProps) {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <span
      className={cn(
        'inline-block border-2 border-brand-500/30 border-t-brand-500 rounded-full animate-spin',
        sizes[size],
        className
      )}
    />
  );
}
