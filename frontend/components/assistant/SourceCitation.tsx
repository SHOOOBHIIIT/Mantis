'use client';

import { FileText } from 'lucide-react';
import type { SourceCitation } from '@/types';
import { cn } from '@/lib/utils';

interface SourceCitationProps {
  source: SourceCitation;
}

export function SourceCitationPill({ source }: SourceCitationProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 px-3 py-2.5 rounded-xl border border-border-subtle bg-bg-tertiary',
        'text-xs text-text-secondary hover:border-border-default hover:text-text-primary transition-all duration-200'
      )}
    >
      <FileText size={12} className="text-brand-400 mt-0.5 shrink-0" />
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-text-primary truncate">{source.doc_title}</span>
          {source.page && (
            <span className="text-text-muted">p.{source.page}</span>
          )}
          {source.section && (
            <span className="px-1.5 py-0.5 bg-brand-500/10 text-brand-400 rounded text-[10px] capitalize">
              {source.section}
            </span>
          )}
          {source.score > 0 && (
            <span className="text-text-muted ml-auto">
              {Math.round(source.score * 100)}% match
            </span>
          )}
        </div>
        <p className="mt-1 text-text-muted line-clamp-1 text-[11px]">{source.snippet}</p>
      </div>
    </div>
  );
}
