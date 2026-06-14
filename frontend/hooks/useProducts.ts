'use client';

import { useQuery } from '@tanstack/react-query';
import { productsAPI, knowledgeAPI } from '@/lib/api';
import type { Product, KnowledgeDocument } from '@/types';

export function useProducts(params?: {
  search?: string;
  category?: string;
  page?: number;
  limit?: number;
}) {
  return useQuery({
    queryKey: ['products', params],
    queryFn: async () => {
      const { data } = await productsAPI.list(params);
      return data;
    },
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await productsAPI.get(id);
      return data;
    },
    enabled: !!id,
  });
}

export function useCompanyProducts(companyId: string) {
  return useQuery({
    queryKey: ['company-products', companyId],
    queryFn: async () => {
      const { data } = await productsAPI.getByCompany(companyId);
      return data as Product[];
    },
    enabled: !!companyId,
  });
}

export function useKnowledgeDocuments(productId: string) {
  return useQuery({
    queryKey: ['knowledge', productId],
    queryFn: async () => {
      const { data } = await knowledgeAPI.list(productId);
      return data as KnowledgeDocument[];
    },
    enabled: !!productId,
  });
}
