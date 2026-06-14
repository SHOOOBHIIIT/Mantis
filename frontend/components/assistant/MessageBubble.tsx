'use client';

import ReactMarkdown from 'react-markdown';
import { Zap } from 'lucide-react';
import { SourceCitationPill } from './SourceCitation';
import { RetrievalBadge } from './RetrievalBadge';
import { cn } from '@/lib/utils';
import type { Message } from '@/types';

interface MessageBubbleProps {
  message: Message;
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-3', isUser ? 'justify-end' : 'justify-start')}>
      {/* Assistant avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-xl bg-brand-500 flex items-center justify-center shrink-0 shadow-lg shadow-brand-500/30">
          <Zap size={14} className="text-white fill-white" />
        </div>
      )}

      <div className={cn('max-w-[80%] space-y-2', isUser ? 'items-end' : 'items-start')}>
        {/* Image preview */}
        {message.image_url && (
          <img
            src={message.image_url}
            alt="Uploaded diagnostic image"
            className="rounded-xl max-w-xs border border-border-default"
          />
        )}

        {/* Message bubble */}
        <div
          className={cn(
            'px-4 py-3 rounded-2xl text-sm leading-relaxed',
            isUser
              ? 'bg-brand-500 text-white rounded-tr-sm'
              : 'bg-bg-tertiary text-text-primary border border-border-subtle rounded-tl-sm'
          )}
        >
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-li:leading-relaxed prose-headings:text-text-primary prose-strong:text-text-primary prose-code:text-brand-400 prose-code:bg-bg-hover prose-code:px-1 prose-code:rounded">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources + retrieval badge */}
        {!isUser && message.sources && message.sources.length > 0 && (
          <div className="space-y-1.5 w-full">
            {message.retrieval_ms !== undefined && (
              <RetrievalBadge ms={message.retrieval_ms} />
            )}
            <div className="space-y-1.5">
              {message.sources.slice(0, 3).map((source, i) => (
                <SourceCitationPill key={i} source={source} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* User avatar */}
      {isUser && (
        <div className="w-8 h-8 rounded-xl bg-bg-tertiary border border-border-default flex items-center justify-center shrink-0 text-sm">
          👤
        </div>
      )}
    </div>
  );
}
