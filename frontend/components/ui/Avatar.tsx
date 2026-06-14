'use client';

import { cn } from '@/lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  const sizes = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const initials = name ? name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase() : '?';

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold overflow-hidden select-none',
        sizes[size],
        !src && 'bg-brand-500/20 text-brand-400',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name || 'avatar'} className="w-full h-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
}
