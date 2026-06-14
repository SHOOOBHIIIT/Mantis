'use client';


import { useRouter } from 'next/navigation';
import { ProductForm } from '@/components/dashboard/ProductForm';
import { useProduct } from '@/hooks/useProducts';
import { useAuthStore } from '@/stores/authStore';
import { Spinner } from '@/components/ui/Spinner';
import { toast } from 'sonner';

interface Props {
  params: { id: string };
}

export default function EditProductPage({ params }: Props) {
  const { id } = params;
  const router = useRouter();
  const { company } = useAuthStore();
  const { data: product, isLoading } = useProduct(id);

  if (isLoading) return <div className="p-8 flex justify-center"><Spinner size="lg" /></div>;
  if (!product) return <div className="p-8 text-text-muted text-sm">Product not found</div>;

  const handleSuccess = () => {
    toast.success('Product updated!');
    router.push('/dashboard/products');
  };

  return (
    <div className="p-6 sm:p-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-text-primary mb-2">Edit Product</h1>
      <p className="text-sm text-text-muted mb-8">{product.name}</p>
      <ProductForm companyId={company?.id || ''} product={product} onSuccess={handleSuccess} />
    </div>
  );
}
