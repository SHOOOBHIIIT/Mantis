'use client';

import Link from 'next/link';
import { PlusCircle, Eye, Pencil, BookOpen } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyProducts } from '@/hooks/useProducts';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { CATEGORY_ICONS } from '@/lib/utils';
import { productsAPI } from '@/lib/api';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

export default function DashboardProductsPage() {
  const { company } = useAuthStore();
  const { data: products, isLoading } = useCompanyProducts(company?.id || '');
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const togglePublish = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await productsAPI.update(id, { is_published: !current });
      queryClient.invalidateQueries({ queryKey: ['company-products'] });
      toast.success(current ? 'Product unpublished' : 'Product published!');
    } catch {
      toast.error('Failed to update product');
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Products</h1>
          <p className="text-sm text-text-muted mt-0.5">{products?.length || 0} products listed</p>
        </div>
        <Link href="/dashboard/products/new">
          <Button><PlusCircle size={14} /> Add Product</Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12"><Spinner size="lg" /></div>
      ) : !products?.length ? (
        <div className="text-center py-16 bg-bg-secondary border border-border-subtle rounded-2xl">
          <p className="text-text-muted mb-4">No products yet</p>
          <Link href="/dashboard/products/new">
            <Button><PlusCircle size={14} /> Create your first product</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-4 px-5 py-4 bg-bg-secondary border border-border-subtle rounded-2xl hover:border-border-default transition-all"
            >
              <span className="text-2xl">{CATEGORY_ICONS[product.category] || '📦'}</span>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-text-primary">{product.name}</p>
                  {product.model_number && (
                    <span className="text-xs text-text-muted">{product.model_number}</span>
                  )}
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-text-muted">{product.category}</span>
                  <span className="text-xs text-text-muted">·</span>
                  <span className="text-xs text-text-muted">
                    {(product.knowledge_documents as unknown[])?.length || 0} documents
                  </span>
                </div>
              </div>

              <Badge variant={product.is_published ? 'success' : 'default'}>
                {product.is_published ? 'Published' : 'Draft'}
              </Badge>

              <div className="flex items-center gap-1">
                <Link href={`/products/${product.id}`} target="_blank">
                  <Button variant="ghost" size="icon" title="Preview">
                    <Eye size={14} />
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/knowledge`}>
                  <Button variant="ghost" size="icon" title="Knowledge Base">
                    <BookOpen size={14} />
                  </Button>
                </Link>
                <Link href={`/dashboard/products/${product.id}/edit`}>
                  <Button variant="ghost" size="icon" title="Edit">
                    <Pencil size={14} />
                  </Button>
                </Link>
                <Button
                  variant={product.is_published ? 'danger' : 'outline'}
                  size="sm"
                  loading={togglingId === product.id}
                  onClick={() => togglePublish(product.id, product.is_published)}
                >
                  {product.is_published ? 'Unpublish' : 'Publish'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
