'use client';


import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { AssistantChat } from '@/components/assistant/AssistantChat';
import { useProduct } from '@/hooks/useProducts';
import { Spinner } from '@/components/ui/Spinner';

interface Props {
  params: { id: string };
}

export default function AssistantPage({ params }: Props) {
  const { id } = params;
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-text-muted mb-4">Product not found</p>
        <Link href="/products" className="text-brand-400 text-sm">← Back to catalog</Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Header bar */}
      <div className="flex items-center gap-4 px-4 sm:px-6 py-3 border-b border-border-subtle bg-bg-secondary/80 backdrop-blur-sm shrink-0">
        <Link
          href={`/products/${id}`}
          className="flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          <ChevronLeft size={12} />
          Back
        </Link>
        <div className="h-4 w-px bg-border-subtle" />
        <div>
          <p className="text-sm font-semibold text-text-primary">{product.name}</p>
          {product.companies && (
            <p className="text-xs text-text-muted">by {product.companies.name}</p>
          )}
        </div>
        <div className="ml-auto">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-success/10 border border-success/20 rounded-full text-[10px] font-medium text-success">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            Assistant Online
          </span>
        </div>
      </div>

      {/* Chat */}
      <div className="flex-1 overflow-hidden">
        <AssistantChat productId={id} productName={product.name} />
      </div>
    </div>
  );
}
