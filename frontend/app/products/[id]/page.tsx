'use client';


import Link from 'next/link';
import { ArrowRight, FileText, Link2, MessageSquare, ExternalLink, ChevronLeft } from 'lucide-react';
import { useProduct } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORY_LABELS, CATEGORY_ICONS, formatDate } from '@/lib/utils';

interface Props {
  params: { id: string };
}

export default function ProductDetailPage({ params }: Props) {
  const { id } = params;
  const { data: product, isLoading, error } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <p className="text-text-muted mb-4">Product not found</p>
        <Link href="/products">
          <Button variant="secondary" size="sm">← Back to catalog</Button>
        </Link>
      </div>
    );
  }

  const docs = product.knowledge_documents || [];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 flex-1">
      {/* Breadcrumb */}
      <Link href="/products" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary mb-6">
        <ChevronLeft size={12} /> Back to catalog
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left — product info */}
        <div className="lg:col-span-3 space-y-6">
          {/* Product hero */}
          <div className="bg-bg-secondary border border-border-subtle rounded-2xl overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-56 object-cover"
              />
            ) : (
              <div className="w-full h-40 bg-bg-tertiary flex items-center justify-center text-6xl opacity-20">
                {CATEGORY_ICONS[product.category] || '📦'}
              </div>
            )}
            <div className="p-6">
              <div className="flex items-start gap-3 flex-wrap">
                <Badge variant="brand">
                  {CATEGORY_ICONS[product.category]} {CATEGORY_LABELS[product.category] || product.category}
                </Badge>
                {product.model_number && (
                  <Badge>Model: {product.model_number}</Badge>
                )}
              </div>
              <h1 className="text-2xl font-bold text-text-primary mt-3">{product.name}</h1>
              {product.companies && (
                <p className="text-sm text-text-muted mt-1">by {product.companies.name}</p>
              )}
              <p className="text-sm text-text-secondary mt-4 leading-relaxed">
                {product.description}
              </p>
              <p className="text-xs text-text-muted mt-3">Listed {formatDate(product.created_at)}</p>
            </div>
          </div>

          {/* Documents */}
          {docs.length > 0 && (
            <div className="bg-bg-secondary border border-border-subtle rounded-2xl p-6">
              <h2 className="text-sm font-semibold text-text-primary mb-4">Knowledge Base</h2>
              <div className="space-y-2">
                {docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-3 bg-bg-tertiary rounded-xl border border-border-subtle"
                  >
                    <div className={doc.type === 'pdf' ? 'w-8 h-8 rounded-lg flex items-center justify-center bg-brand-500/10' : 'w-8 h-8 rounded-lg flex items-center justify-center bg-warning/10'}>
                      {doc.type === 'pdf' ? (
                        <FileText size={14} className="text-brand-400" />
                      ) : (
                        <Link2 size={14} className="text-warning" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-text-primary truncate">{doc.title}</p>
                      {doc.type === 'pdf' && doc.page_count && (
                        <p className="text-xs text-text-muted">{doc.page_count} pages{doc.chunk_count ? ` · ${doc.chunk_count} indexed chunks` : ''}</p>
                      )}
                    </div>
                    {(doc.file_url || doc.external_url) && (
                      <a href={doc.file_url || doc.external_url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink size={13} className="text-text-muted hover:text-text-secondary" />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — diagnostic CTA */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-bg-secondary border border-brand-500/20 rounded-2xl p-6 sticky top-24">
            <div className="w-12 h-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center mb-4">
              <MessageSquare size={20} className="text-brand-400" />
            </div>
            <h2 className="text-base font-semibold text-text-primary mb-2">
              AI Diagnostic Assistant
            </h2>
            <p className="text-xs text-text-muted leading-relaxed mb-5">
              Describe your issue and our AI will guide you through a systematic diagnosis — citing
              exact sections from the manual.
            </p>

            <Link href={`/products/${id}/assistant`}>
              <Button className="w-full" size="lg">
                <MessageSquare size={15} />
                Start Diagnosis
                <ArrowRight size={14} />
              </Button>
            </Link>

            <div className="mt-4 space-y-2">
              {[
                { icon: '💬', label: 'Text, voice & image input' },
                { icon: '📄', label: `${docs.length} manual${docs.length !== 1 ? 's' : ''} indexed` },
                { icon: '⚡', label: 'Sub-10ms MOSS retrieval' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-2 text-xs text-text-muted">
                  <span>{f.icon}</span> {f.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
