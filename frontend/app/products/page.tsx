'use client';

import { useState, useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { ProductGrid } from '@/components/products/ProductGrid';
import { ProductSearchBar } from '@/components/products/ProductSearchBar';
import { CategoryFilter } from '@/components/products/CategoryFilter';
import { useProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch] = useDebounce(search, 400);

  const { data, isLoading } = useProducts({
    search: debouncedSearch || undefined,
    category: category || undefined,
    page,
    limit: 12,
  });

  const handleSearch = useCallback((v: string) => {
    setSearch(v);
    setPage(1);
  }, []);

  const handleCategory = useCallback((c: string) => {
    setCategory(c);
    setPage(1);
  }, []);

  const totalPages = data ? Math.ceil(data.total / 12) : 1;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 flex-1">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-text-primary mb-2">Product Catalog</h1>
        <p className="text-text-secondary text-sm">
          Find your product and get AI-powered diagnostic support.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <ProductSearchBar
          value={search}
          onChange={handleSearch}
          className="flex-1"
        />
      </div>

      <CategoryFilter selected={category} onChange={handleCategory} />

      <div className="mt-6">
        {data && (
          <p className="text-xs text-text-muted mb-4">
            {data.total} product{data.total !== 1 ? 's' : ''} found
            {debouncedSearch && ` for "${debouncedSearch}"`}
            {category && ` in ${category}`}
          </p>
        )}

        <ProductGrid
          products={data?.products || []}
          loading={isLoading}
          emptyMessage={
            debouncedSearch
              ? `No products found for "${debouncedSearch}"`
              : 'No products available in this category yet'
          }
        />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft size={14} /> Prev
            </Button>
            <span className="text-sm text-text-muted">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next <ChevronRight size={14} />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
