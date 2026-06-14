'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Settings,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';
import { Avatar } from '@/components/ui/Avatar';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/products', label: 'Products', icon: Package },
  { href: '/dashboard/products/new', label: 'Add Product', icon: PlusCircle },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, company } = useAuthStore();

  return (
    <aside className="w-60 shrink-0 bg-bg-secondary border-r border-border-subtle min-h-screen flex flex-col">
      {/* Company info */}
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <Avatar name={company?.name || user?.email} size="md" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-text-primary truncate">
              {company?.name || 'My Company'}
            </p>
            <p className="text-xs text-text-muted truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href) && !(pathname === '/dashboard' && href !== '/dashboard');
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group',
                isActive
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
              )}
            >
              <Icon size={16} className={cn(isActive ? 'text-brand-400' : 'text-text-muted group-hover:text-text-secondary')} />
              {label}
              {isActive && <ChevronRight size={12} className="ml-auto text-brand-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border-subtle">
        <Link href="/products" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
          ← Back to marketplace
        </Link>
      </div>
    </aside>
  );
}
