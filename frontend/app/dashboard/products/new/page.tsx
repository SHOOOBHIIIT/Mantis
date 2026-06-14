'use client';

import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/dashboard/ProductForm';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import type { Product } from '@/types';

export default function NewProductPage() {
  const router = useRouter();
  const { company } = useAuthStore();

  if (!company) {
    return (
      <div className="p-8 text-text-muted text-sm">
        Company account required to create products.
      </div>
    );
  }

  const handleSuccess = (product: Product) => {
    toast.success('Product created!');
    router.push(`/dashboard/products/${product.id}/knowledge`);
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Add New Product</h1>
      <p className="text-sm text-text-muted mb-8">
        Fill in the product details. You can add knowledge documents in the next step.
      </p>
      <ProductForm companyId={company.id} onSuccess={handleSuccess} />
    </div>
  );
}
