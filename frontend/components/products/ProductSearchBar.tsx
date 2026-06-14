'use client';

import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductSearchBarProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export function ProductSearchBar({ value, onChange, placeholder, className }: ProductSearchBarProps) {
  return (
    <div className={cn('relative', className)}>
      <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || 'Search products…'}
        className="w-full bg-bg-secondary border border-border-default rounded-xl pl-10 pr-10 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
