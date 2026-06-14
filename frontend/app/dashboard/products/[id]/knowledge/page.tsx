'use client';


import { KnowledgeUploader } from '@/components/dashboard/KnowledgeUploader';
import { DocumentList } from '@/components/dashboard/DocumentList';
import { useKnowledgeDocuments, useProduct } from '@/hooks/useProducts';
import { useQueryClient } from '@tanstack/react-query';
import { Spinner } from '@/components/ui/Spinner';
import { Badge } from '@/components/ui/Badge';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

interface Props {
  params: { id: string };
}

export default function KnowledgePage({ params }: Props) {
  const { id } = params;
  const queryClient = useQueryClient();
  const { data: product, isLoading: productLoading } = useProduct(id);
  const { data: documents, isLoading: docsLoading } = useKnowledgeDocuments(id);

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['knowledge', id] });
    queryClient.invalidateQueries({ queryKey: ['product', id] });
  };

  if (productLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;

  const indexedCount = documents?.filter((d) => d.indexed).length || 0;

  return (
    <div className="p-6 sm:p-8 max-w-3xl">
      <Link
        href="/dashboard/products"
        className="inline-flex items-center gap-1 text-xs text-text-muted hover:text-text-secondary mb-6"
      >
        <ChevronLeft size={12} /> Back to products
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-text-primary">Knowledge Base</h1>
          {documents && (
            <Badge variant={indexedCount === documents.length && documents.length > 0 ? 'success' : 'warning'}>
              {indexedCount}/{documents.length} indexed
            </Badge>
          )}
        </div>
        <p className="text-sm text-text-muted mt-1">{product?.name}</p>
        <p className="text-xs text-text-muted mt-1">
          Upload PDF manuals, service guides, or add links. Documents are automatically chunked and indexed for AI retrieval.
        </p>
      </div>

      {/* Uploader */}
      <div className="mb-6">
        <KnowledgeUploader productId={id} onUploaded={refresh} />
      </div>

      {/* Document list */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">
          Uploaded Documents ({documents?.length || 0})
        </h2>
        {docsLoading ? (
          <div className="flex items-center justify-center py-8"><Spinner /></div>
        ) : (
          <DocumentList documents={documents || []} onDeleted={refresh} />
        )}
      </div>
    </div>
  );
}
