'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CATEGORY_LABELS, CATEGORY_ICONS, truncate } from '@/lib/utils';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const categoryIcon = CATEGORY_ICONS[product.category] || '📦';
  const categoryLabel = CATEGORY_LABELS[product.category] || product.category;

  return (
    <Link href={`/products/${product.id}`} className="block group">
      <motion.div 
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-bg-secondary/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden transition-all duration-300 hover:border-brand-500/30 hover:shadow-[0_0_30px_rgba(14,165,233,0.15)] relative"
      >
        {/* Glow behind card */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />
        
        {/* Image */}
        <div className="relative h-48 bg-black/20 overflow-hidden z-10">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 group-hover:scale-110 transition-transform duration-700">
              {categoryIcon}
            </div>
          )}
          {/* Category badge */}
          <div className="absolute top-4 left-4">
            <Badge variant="brand" className="bg-black/60 backdrop-blur-md border-white/10 shadow-lg">
              {categoryIcon} {categoryLabel}
            </Badge>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 relative z-10">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-lg font-bold text-text-primary truncate group-hover:text-brand-400 transition-colors">
                {product.name}
              </h3>
              {product.model_number && (
                <p className="text-xs font-medium text-text-muted mt-1 uppercase tracking-wider">Model: {product.model_number}</p>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-brand-500/20 transition-colors shadow-inner">
              <ArrowRight
                size={14}
                className="text-text-muted group-hover:text-brand-400 group-hover:translate-x-0.5 transition-all shrink-0"
              />
            </div>
          </div>

          <p className="text-sm text-text-secondary mt-3 line-clamp-2 leading-relaxed">
            {truncate(product.description, 100)}
          </p>

          {/* Company name */}
          {product.companies && (
            <div className="mt-5 pt-5 border-t border-white/5 flex items-center gap-3">
              <div className="w-6 h-6 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center text-xs font-bold text-brand-300">
                {product.companies.name[0]}
              </div>
              <span className="text-xs font-semibold text-text-muted tracking-wide">{product.companies.name}</span>
            </div>
          )}
        </div>
      </motion.div>
    </Link>
  );
}
