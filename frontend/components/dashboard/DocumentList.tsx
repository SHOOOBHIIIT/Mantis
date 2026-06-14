'use client';

import { FileText, Link2, Trash2, CheckCircle, Clock, AlertCircle, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { knowledgeAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import type { KnowledgeDocument } from '@/types';
import { useState } from 'react';

interface DocumentListProps {
  documents: KnowledgeDocument[];
  onDeleted: () => void;
}

export function DocumentList({ documents, onDeleted }: DocumentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this document? This will remove it from the knowledge base.')) return;
    setDeletingId(id);
    try {
      await knowledgeAPI.delete(id);
      onDeleted();
    } catch {
      alert('Failed to delete document.');
    } finally {
      setDeletingId(null);
    }
  };

  if (!documents.length) {
    return (
      <div className="text-center py-12 text-text-muted text-sm">
        <FileText size={32} className="mx-auto mb-3 opacity-30" />
        No documents uploaded yet.
        <br />
        <span className="text-xs">Upload PDFs or add links above to build the knowledge base.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="flex items-center gap-3 px-4 py-3 bg-bg-tertiary border border-border-subtle rounded-xl group"
        >
          <div className="shrink-0">
            {doc.type === 'pdf' ? (
              <div className="w-9 h-9 rounded-lg bg-brand-500/10 flex items-center justify-center">
                <FileText size={16} className="text-brand-400" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-lg bg-warning/10 flex items-center justify-center">
                <Link2 size={16} className="text-warning" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-text-primary truncate">{doc.title}</span>
              {doc.type === 'pdf' && doc.page_count && (
                <span className="text-xs text-text-muted">{doc.page_count}p</span>
              )}
              {doc.chunk_count > 0 && (
                <span className="text-xs text-text-muted">{doc.chunk_count} chunks</span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              {doc.indexed ? (
                <span className="flex items-center gap-1 text-[10px] text-success">
                  <CheckCircle size={10} /> Indexed
                </span>
              ) : doc.indexing_error ? (
                <span className="flex items-center gap-1 text-[10px] text-error">
                  <AlertCircle size={10} /> Error: {doc.indexing_error.slice(0, 40)}
                </span>
              ) : (
                <span className="flex items-center gap-1 text-[10px] text-text-muted">
                  <Clock size={10} /> Indexing…
                </span>
              )}
              <span className="text-[10px] text-text-muted">{formatDate(doc.created_at)}</span>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {(doc.file_url || doc.external_url) && (
              <a
                href={doc.file_url || doc.external_url}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="ghost" size="icon">
                  <ExternalLink size={13} />
                </Button>
              </a>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleDelete(doc.id)}
              loading={deletingId === doc.id}
              className="text-error/60 hover:text-error hover:bg-error/10"
            >
              <Trash2 size={13} />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
