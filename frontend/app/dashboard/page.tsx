'use client';

import Link from 'next/link';
import { Package, PlusCircle, ArrowRight, Zap, FileText } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { useCompanyProducts } from '@/hooks/useProducts';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';

export default function DashboardPage() {
  const { company } = useAuthStore();
  const { data: products, isLoading } = useCompanyProducts(company?.id || '');

  const publishedCount = products?.filter((p) => p.is_published).length || 0;
  const totalDocs = products?.reduce((acc, p) => acc + (p.knowledge_documents?.length || 0), 0) || 0;

  return (
    <div className="p-6 sm:p-8 max-w-4xl">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text-primary">
          Welcome, {company?.name || 'Company'} 👋
        </h1>
        <p className="text-sm text-text-muted mt-1">
          Manage your products and knowledge base from here.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products?.length || 0, icon: Package, color: 'brand' },
          { label: 'Published', value: publishedCount, icon: Zap, color: 'success' },
          { label: 'Documents', value: totalDocs, icon: FileText, color: 'warning' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-bg-secondary border border-border-subtle rounded-2xl p-5">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${
              color === 'brand' ? 'bg-brand-500/10' : color === 'success' ? 'bg-success/10' : 'bg-warning/10'
            }`}>
              <Icon size={16} className={
                color === 'brand' ? 'text-brand-400' : color === 'success' ? 'text-success' : 'text-warning'
              } />
            </div>
            <p className="text-2xl font-bold text-text-primary">{value}</p>
            <p className="text-xs text-text-muted mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="flex gap-3 mb-8 flex-wrap">
        <Link href="/dashboard/products/new">
          <Button>
            <PlusCircle size={14} /> Add Product
          </Button>
        </Link>
        <Link href="/dashboard/products">
          <Button variant="secondary">
            <Package size={14} /> View All Products
          </Button>
        </Link>
      </div>

      {/* Recent products */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Products</h2>
        {isLoading ? (
          <div className="flex items-center justify-center py-8"><Spinner /></div>
        ) : !products?.length ? (
          <div className="text-center py-10 bg-bg-secondary border border-border-subtle rounded-2xl">
            <Package size={28} className="mx-auto mb-3 text-text-muted opacity-50" />
            <p className="text-sm text-text-muted">No products yet.</p>
            <Link href="/dashboard/products/new" className="inline-block mt-3">
              <Button size="sm">Add your first product</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {products.slice(0, 5).map((product) => (
              <Link
                key={product.id}
                href={`/dashboard/products/${product.id}/edit`}
                className="flex items-center gap-4 px-4 py-3 bg-bg-secondary border border-border-subtle rounded-xl hover:border-border-default transition-all group"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary">{product.name}</p>
                  <p className="text-xs text-text-muted">{product.category}</p>
                </div>
                <Badge variant={product.is_published ? 'success' : 'default'}>
                  {product.is_published ? 'Published' : 'Draft'}
                </Badge>
                <ArrowRight size={14} className="text-text-muted group-hover:text-text-secondary" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
