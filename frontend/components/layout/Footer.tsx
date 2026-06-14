'use client';

import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border-subtle bg-bg-primary mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-brand-500 flex items-center justify-center">
              <Zap size={12} className="text-white fill-white" />
            </div>
            <span className="text-sm font-semibold text-text-primary">Mantis</span>
          </div>
          <p className="text-xs text-text-muted">
            AI-powered product diagnostics — MOSS × GPT-4o
          </p>
          <div className="flex items-center gap-4 text-xs text-text-muted">
            <Link href="/products" className="hover:text-text-secondary transition-colors">
              Products
            </Link>
            <span>·</span>
            <span>Built with ❤️ at hackathon</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
