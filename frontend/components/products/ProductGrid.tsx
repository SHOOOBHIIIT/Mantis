'use client';

import { ProductCard } from './ProductCard';
import { Spinner } from '@/components/ui/Spinner';
import type { Product } from '@/types';

interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  emptyMessage?: string;
}

export function ProductGrid({ products, loading, emptyMessage }: ProductGridProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="text-5xl mb-4 opacity-30">📦</div>
        <p className="text-text-muted text-sm">
          {emptyMessage || 'No products found'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
