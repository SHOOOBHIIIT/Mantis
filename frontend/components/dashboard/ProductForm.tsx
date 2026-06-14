'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { productsAPI } from '@/lib/api';
import { cn, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils';
import type { Product } from '@/types';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  model_number: z.string().optional(),
  category: z.string().min(1, 'Please select a category'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  image_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

type FormValues = z.infer<typeof schema>;

const CATEGORIES = ['scooter', 'ac', 'washing_machine', 'electronics', 'appliance', 'other'];

interface ProductFormProps {
  companyId: string;
  product?: Product;
  onSuccess: (product: Product) => void;
}

export function ProductForm({ companyId, product, onSuccess }: ProductFormProps) {
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: product?.name || '',
      model_number: product?.model_number || '',
      category: product?.category || '',
      description: product?.description || '',
      image_url: product?.image_url || '',
    },
  });

  const selectedCategory = watch('category');

  const onSubmit = async (data: FormValues) => {
    const payload = {
      name: data.name,
      model_number: data.model_number || undefined,
      category: data.category,
      description: data.description,
      image_url: data.image_url || undefined,
    };

    let result;
    if (isEdit) {
      const { data: res } = await productsAPI.update(product.id, payload);
      result = res;
    } else {
      const { data: res } = await productsAPI.create(payload, companyId);
      result = res;
    }
    onSuccess(result);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <Input
        id="name"
        label="Product Name *"
        placeholder="e.g. Ola S1 Pro Electric Scooter"
        error={errors.name?.message}
        {...register('name')}
      />

      <Input
        id="model"
        label="Model Number"
        placeholder="e.g. OLA-S1-PRO-2024"
        {...register('model_number')}
      />

      {/* Category selector */}
      <div className="space-y-1.5">
        <label className="text-sm text-text-secondary font-medium">Category *</label>
        <div className="grid grid-cols-3 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setValue('category', cat)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-xs font-medium transition-all',
                selectedCategory === cat
                  ? 'bg-brand-500/10 border-brand-500/40 text-brand-400'
                  : 'border-border-subtle text-text-muted hover:border-border-default hover:text-text-secondary bg-bg-tertiary'
              )}
            >
              <span className="text-lg">{CATEGORY_ICONS[cat]}</span>
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>
        {errors.category && (
          <p className="text-xs text-error">{errors.category.message}</p>
        )}
      </div>

      <Textarea
        id="description"
        label="Description *"
        placeholder="Describe this product — what it does, key features, common use cases…"
        rows={4}
        error={errors.description?.message}
        {...register('description')}
      />

      <Input
        id="image_url"
        label="Product Image URL"
        placeholder="https://example.com/product.jpg"
        error={errors.image_url?.message}
        {...register('image_url')}
      />

      <Button type="submit" loading={isSubmitting} className="w-full" size="lg">
        {isSubmitting ? 'Saving…' : isEdit ? 'Save Changes' : 'Create Product'}
      </Button>
    </form>
  );
}
