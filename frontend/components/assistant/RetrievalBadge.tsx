'use client';

import { Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RetrievalBadgeProps {
  ms: number;
  className?: string;
}

export function RetrievalBadge({ ms, className }: RetrievalBadgeProps) {
  const isFast = ms < 50;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border',
        isFast
          ? 'bg-success/5 border-success/15 text-success/70'
          : 'bg-brand-500/5 border-brand-500/15 text-brand-400/70',
        className
      )}
    >
      <Zap size={9} />
      Retrieved in {ms}ms via MOSS
    </span>
  );
}
